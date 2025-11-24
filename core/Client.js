const { Client, GatewayIntentBits, Partials, Collection, Options } = require('discord.js');
const CommandHandler = require('../handlers/CommandHandler');
const ComponentHandler = require('../handlers/ComponentHandler');
const EventHandler = require('../handlers/EventHandler');
const CommandRegistry = require('../registry/CommandRegistry');
const ComponentRegistry = require('../registry/ComponentRegistry');
const WebhookLogger = require('../utilities/WebhookLogger');
const PermissionHandler = require('../utilities/PermissionHandler');
const ErrorHandler = require('../utilities/ErrorHandler');
const logger = require('../utilities/Logger');
const config = require('../config');

class NpgClient extends Client {
    constructor(cluster) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.GuildMember
            ],
            shards: cluster.ids,
            shardCount: cluster.count,
            // Memory-efficient cache configuration for large scale (3.5k+ servers, 5M+ users)
            makeCache: Options.cacheWithLimits({
                ...Options.DefaultMakeCacheSettings,
                MessageManager: config.performance?.messageCacheMaxSize || 100,
                PresenceManager: 0,
                ReactionManager: 0,
                ReactionUserManager: 0
            }),
            // Cache sweepers for automatic cleanup
            sweepers: {
                messages: {
                    interval: config.performance?.messageSweepInterval || 300,
                    lifetime: config.performance?.messageCacheLifetime || 300
                },
                users: {
                    interval: 3600, // 1 hour
                    filter: () => user => user.bot && user.id !== this.user.id
                },
                threads: {
                    interval: 3600, // 1 hour
                    lifetime: config.performance?.threadCacheLifetime || 3600
                }
            }
        });

        this.cluster = cluster;
        this.config = config;
        this.logger = logger;
        
        this.webhookLogger = new WebhookLogger(this);
        this.permissionHandler = new PermissionHandler(this);
        this.errorHandler = new ErrorHandler(this);
        
        this.registry = {
            commands: new CommandRegistry(),
            components: new ComponentRegistry()
        };

        this.handlers = {
            commands: new CommandHandler(this),
            components: new ComponentHandler(this),
            events: new EventHandler(this)
        };

        this.setupGlobalErrorHandlers();
        this.setupMemoryMonitoring();
        this.setupEventListeners();
    }
    
    setupGlobalErrorHandlers() {
        process.on('uncaughtException', (error) => {
            this.errorHandler.handleProcessError(error, 'uncaughtException');
        });

        process.on('unhandledRejection', (error) => {
            this.errorHandler.handleProcessError(error, 'unhandledRejection');
        });

        this.on('error', (error) => {
            this.errorHandler.handleEventError(error, 'client');
        });

        this.on('warn', (warning) => {
            this.logger.warn(warning, this.cluster?.id);
        });

        this.on('shardError', (error, shardId) => {
            this.logger.error(`Shard ${shardId} error:`, error, this.cluster?.id);
        });

        this.on('shardDisconnect', (event, shardId) => {
            this.logger.warn(`Shard ${shardId} disconnected`, this.cluster?.id);
        });

        this.on('shardReconnecting', (shardId) => {
            this.logger.info(`Shard ${shardId} reconnecting...`, this.cluster?.id);
        });

        this.on('shardResume', (shardId, replayedEvents) => {
            this.logger.info(`Shard ${shardId} resumed (${replayedEvents} events replayed)`, this.cluster?.id);
        });
    }
    
    setupMemoryMonitoring() {
        if (!this.config.monitoring?.enabled) return;
        
        // Monitor memory usage every minute
        setInterval(() => {
            const memoryUsage = process.memoryUsage();
            const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
            
            // Log high memory usage (use monitoring config, not performance config)
            if (memoryMB > this.config.monitoring.clusterMemoryThreshold) {
                this.logger.warn(`High memory usage: ${memoryMB}MB`, this.cluster?.id);
                
                // Send warning to cluster manager
                if (process.send) {
                    process.send({
                        type: 'memoryWarning',
                        clusterId: this.cluster?.id,
                        memoryMB
                    });
                }
            }
            
            // Force garbage collection if memory exceeds 90% of limit
            if (memoryMB > this.config.performance.maxMemoryPerCluster * 0.9 && global.gc) {
                this.logger.warn(`Forcing garbage collection at ${memoryMB}MB`, this.cluster?.id);
                global.gc();
            }
        }, this.config.performance?.memoryCheckInterval || 60000);
    }

    setupEventListeners() {
        this.on('interactionCreate', async (interaction) => {
            try {
                if (interaction.isChatInputCommand()) {
                    await this.handlers.commands.handleSlashCommand(interaction);
                } else if (interaction.isButton()) {
                    await this.handlers.components.handleButton(interaction);
                } else if (interaction.isStringSelectMenu()) {
                    await this.handlers.components.handleSelectMenu(interaction);
                } else if (interaction.isModalSubmit()) {
                    await this.handlers.components.handleModal(interaction);
                }
            } catch (error) {
                logger.error('Error handling interaction:', error, this.cluster.id);
                await this.errorHandler.handleInteractionError(error, interaction);
            }
        });

        this.on('messageCreate', async (message) => {
            try {
                await this.handlers.commands.handlePrefixCommand(message);
            } catch (error) {
                logger.error('Error handling message:', error, this.cluster.id);
                // Don't send error messages for every message - only command errors are handled in the handler
            }
        });

        this.once('ready', () => {
            logger.shardReady(this.cluster.id, this.cluster.count);
            this.setPresence();
            
            if (this.config.webhooks.commandLog) {
                this.webhookLogger.setWebhookURL(this.config.webhooks.commandLog);
            }
            if (this.config.webhooks.shardLog) {
                this.webhookLogger.logShardReady(this.cluster.id, this.cluster.count, this.guilds.cache.size);
            }
        });
    }

    setPresence() {
        const activities = this.config.presence.activities;
        let current = 0;

        const updatePresence = () => {
            this.user.setPresence({
                status: this.config.presence.status,
                activities: [activities[current]]
            });
            current = (current + 1) % activities.length;
        };

        updatePresence();
        setInterval(updatePresence, 30000);
    }

    async initialize() {
        try {
            logger.printShardInfo(this.cluster.id, this.cluster.count);
            
            await this.handlers.commands.loadCommands();
            await this.handlers.components.loadComponents();
            await this.handlers.events.loadEvents();

            await this.login(this.config.bot.token);
        } catch (error) {
            logger.error('Failed to initialize client:', error, this.cluster.id);
            process.exit(1);
        }
    }
}

module.exports = NpgClient;
