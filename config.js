require('dotenv').config();

module.exports = {
    bot: {
        name: process.env.BOT_NAME || 'Npg',
        owner: process.env.OWNER_NAME || 'Npg',
        version: '1.0.0',
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        prefix: process.env.PREFIX || '!',
        owners: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : [],
        testGuild: process.env.TEST_GUILD_ID || null
    },
    
    sharding: {
        totalShards: 'auto', // Auto-calculate based on guild count (1 shard per 2500 guilds)
        shardsPerClusters: 2, // 2 shards per cluster for optimal load distribution
        mode: 'process', // Each cluster runs in separate process for fault isolation
        token: process.env.DISCORD_TOKEN,
        respawn: true, // Auto-respawn clusters on crash
        spawnTimeout: -1, // Disable timeout (use -1 for production)
        restartDelay: 5000, // 5s delay before restart
        maxRestarts: 5, // Max restarts before giving up
        restartMode: 'respawn' // Use respawn mode for graceful restart
    },

    // Performance & Memory Management
    performance: {
        cacheLifetime: 3600, // 1 hour cache lifetime (in seconds)
        messageCacheLifetime: 300, // 5 minutes for messages
        messageCacheMaxSize: 100, // Max 100 messages per channel
        messageSweepInterval: 300, // Sweep every 5 minutes
        presenceCacheLifetime: 600, // 10 minutes for presences
        threadCacheLifetime: 3600, // 1 hour for threads
        maxMemoryPerCluster: 512, // 512MB max per cluster (in MB)
        memoryCheckInterval: 60000 // Check memory every minute
    },

    // Health Monitoring
    monitoring: {
        enabled: true,
        healthCheckInterval: 30000, // Health check every 30 seconds
        shardPingThreshold: 300, // Alert if shard ping > 300ms
        clusterMemoryThreshold: 400, // Alert if cluster memory > 400MB
        webhookAlerts: process.env.ALERT_WEBHOOK || null
    },

    presence: {
        status: 'online',
        activities: [
            {
                name: 'with Discord.js v14',
                type: 0
            },
            {
                name: 'Npg Bot | Sharded',
                type: 2
            }
        ]
    },

    colors: {
        default: 0x5865F2,
        success: 0x57F287,
        error: 0xED4245,
        warning: 0xFEE75C
    },

    webhooks: {
        commandLog: process.env.COMMAND_LOG_WEBHOOK || null,
        errorLog: process.env.ERROR_LOG_WEBHOOK || null,
        shardLog: process.env.SHARD_LOG_WEBHOOK || null
    },
    
    permissions: {
        checkOwner: true,
        checkPermissions: true,
        sendErrorMessages: true
    },
    
    developer: {
        enableEval: process.env.ENABLE_EVAL === 'true' || false
    }
};
