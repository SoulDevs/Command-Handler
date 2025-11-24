const { ClusterManager } = require('discord-hybrid-sharding');
const logger = require('./utilities/Logger');
const config = require('./config');
const { EmbedBuilder, WebhookClient } = require('discord.js');

// Track cluster restart attempts for exponential backoff
const clusterRestarts = new Map();
const MAX_RESTART_ATTEMPTS = config.sharding.maxRestarts || 5;
const BASE_RESTART_DELAY = config.sharding.restartDelay || 5000;

// Initialize webhook client for alerts
let webhookClient = null;
if (config.monitoring.webhookAlerts) {
    try {
        webhookClient = new WebhookClient({ url: config.monitoring.webhookAlerts });
    } catch (error) {
        logger.error('Failed to initialize webhook client:', error);
    }
}

// Send alert to webhook
async function sendWebhookAlert(options) {
    if (!webhookClient) return;
    
    try {
        const embed = new EmbedBuilder()
            .setTitle(options.title || 'Alert')
            .setDescription(options.description || 'No description')
            .setColor(options.color || 0xED4245)
            .setTimestamp();
        
        await webhookClient.send({ embeds: [embed] });
    } catch (error) {
        logger.error('Failed to send webhook alert:', error);
    }
}

async function startClusters() {
    await logger.printBanner(config);

    const manager = new ClusterManager('./core/bot.js', {
        totalShards: config.sharding.totalShards,
        shardsPerClusters: config.sharding.shardsPerClusters,
        mode: config.sharding.mode,
        token: config.sharding.token,
        respawn: config.sharding.respawn,
        spawnTimeout: config.sharding.spawnTimeout,
        restartMode: config.sharding.restartMode
    });

    // Handle cluster creation
    manager.on('clusterCreate', cluster => {
        logger.info(`Launched Cluster ${cluster.id}`, cluster.id);
        
        // Initialize restart counter for this cluster
        if (!clusterRestarts.has(cluster.id)) {
            clusterRestarts.set(cluster.id, { count: 0, lastRestart: Date.now() });
        }
        
        cluster.on('ready', () => {
            logger.clusterReady(cluster.id, manager.totalClusters);
            // Reset restart counter on successful ready
            clusterRestarts.set(cluster.id, { count: 0, lastRestart: Date.now() });
        });

        // Handle cluster death with auto-respawn and exponential backoff
        cluster.on('death', () => {
            logger.error(`Cluster ${cluster.id} died!`, null, cluster.id);
            handleClusterDeath(cluster, manager);
        });

        cluster.on('error', (error) => {
            logger.error(`Cluster ${cluster.id} error:`, error, cluster.id);
        });

        cluster.on('disconnect', () => {
            logger.warn(`Cluster ${cluster.id} disconnected`, cluster.id);
        });

        cluster.on('reconnecting', () => {
            logger.info(`Cluster ${cluster.id} reconnecting...`, cluster.id);
        });

        cluster.on('message', (message) => {
            if (message._sEval) return;
            
            // Handle health check pings
            if (message.type === 'healthCheck') {
                cluster.send({ type: 'healthCheckResponse', clusterId: cluster.id });
                return;
            }
            
            // Handle memory warnings
            if (message.type === 'memoryWarning') {
                logger.warn(`Cluster ${cluster.id} high memory usage: ${message.memoryMB}MB`, cluster.id);
                
                // Send alert to webhook if configured
                if (config.monitoring.webhookAlerts) {
                    sendWebhookAlert({
                        title: '⚠️ High Memory Usage',
                        description: `Cluster ${cluster.id} is using ${message.memoryMB}MB`,
                        color: 0xFEE75C
                    });
                }
                
                // Gracefully restart cluster when it reaches monitoring threshold to prevent OOM
                if (message.memoryMB >= config.monitoring.clusterMemoryThreshold) {
                    logger.error(`Cluster ${cluster.id} reached memory threshold (${message.memoryMB}MB). Initiating graceful restart...`, null, cluster.id);
                    gracefulRestartCluster(cluster);
                }
            }
        });
    });

    // Global process error handlers
    process.on('uncaughtException', (error) => {
        logger.error('Uncaught Exception in Cluster Manager:', error);
    });

    process.on('unhandledRejection', (error) => {
        logger.error('Unhandled Rejection in Cluster Manager:', error);
    });

    // Spawn all clusters
    try {
        await manager.spawn({ timeout: config.sharding.spawnTimeout });
        logger.success(`Successfully spawned ${manager.totalClusters} clusters with ${manager.totalShards} shards`);
        
        // Start health monitoring
        startHealthMonitoring(manager);
    } catch (error) {
        logger.error('Fatal error spawning clusters:', error);
        process.exit(1);
    }
}

// Handle cluster death with exponential backoff
function handleClusterDeath(cluster, manager) {
    const restartData = clusterRestarts.get(cluster.id) || { count: 0, lastRestart: 0 };
    const timeSinceLastRestart = Date.now() - restartData.lastRestart;
    
    // Reset counter if it's been more than 5 minutes since last restart
    if (timeSinceLastRestart > 300000) {
        restartData.count = 0;
    }
    
    restartData.count++;
    restartData.lastRestart = Date.now();
    clusterRestarts.set(cluster.id, restartData);
    
    if (restartData.count > MAX_RESTART_ATTEMPTS) {
        logger.error(
            `Cluster ${cluster.id} exceeded max restart attempts (${MAX_RESTART_ATTEMPTS}). Manual intervention required.`,
            null,
            cluster.id
        );
        return;
    }
    
    // Calculate exponential backoff delay
    const delay = BASE_RESTART_DELAY * Math.pow(2, restartData.count - 1);
    
    logger.warn(
        `Cluster ${cluster.id} will respawn in ${delay}ms (attempt ${restartData.count}/${MAX_RESTART_ATTEMPTS})`,
        cluster.id
    );
    
    setTimeout(() => {
        logger.info(`Respawning Cluster ${cluster.id}...`, cluster.id);
        cluster.respawn({ delay: 0 }).catch(error => {
            logger.error(`Failed to respawn Cluster ${cluster.id}:`, error, cluster.id);
        });
    }, delay);
}

// Graceful cluster restart
async function gracefulRestartCluster(cluster) {
    try {
        logger.info(`Initiating graceful restart for Cluster ${cluster.id}...`, cluster.id);
        await cluster.respawn({ delay: 3000 });
        logger.success(`Cluster ${cluster.id} gracefully restarted`, cluster.id);
    } catch (error) {
        logger.error(`Failed to gracefully restart Cluster ${cluster.id}:`, error, cluster.id);
    }
}

// Health monitoring system
function startHealthMonitoring(manager) {
    if (!config.monitoring?.enabled) return;
    
    logger.info('Starting cluster health monitoring...');
    
    setInterval(async () => {
        try {
            const healthData = await manager.broadcastEval(client => {
                // Ensure client is ready before accessing properties
                if (!client.readyAt || !client.user) {
                    return null;
                }
                
                return {
                    clusterId: client.cluster?.id ?? 0,
                    guilds: client.guilds?.cache?.size ?? 0,
                    users: client.users?.cache?.size ?? 0,
                    ping: client.ws?.ping ?? 0,
                    uptime: client.uptime ?? 0,
                    memoryMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024)
                };
            });
            
            healthData.forEach(data => {
                // Skip null data (client not ready)
                if (!data) return;
                
                // Check for high ping
                if (data.ping > config.monitoring.shardPingThreshold) {
                    logger.warn(`Cluster ${data.clusterId} high ping: ${data.ping}ms`, data.clusterId);
                }
                
                // Check for high memory
                if (data.memoryMB > config.monitoring.clusterMemoryThreshold) {
                    logger.warn(`Cluster ${data.clusterId} high memory: ${data.memoryMB}MB`, data.clusterId);
                }
            });
        } catch (error) {
            logger.error('Health monitoring error:', error);
        }
    }, config.monitoring.healthCheckInterval);
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    logger.warn('Received SIGTERM signal, initiating graceful shutdown...');
    process.exit(0);
});

process.on('SIGINT', async () => {
    logger.warn('Received SIGINT signal, initiating graceful shutdown...');
    process.exit(0);
});

startClusters();
