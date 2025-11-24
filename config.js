require('dotenv').config();

module.exports = {
    bot: {
        token: process.env.DISCORD_TOKEN,
        clientId: process.env.CLIENT_ID,
        prefix: process.env.PREFIX || '!',
        owners: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : [],
        testGuild: process.env.TEST_GUILD_ID || null
    },
    
    sharding: {
        totalShards: 'auto',
        shardsPerClusters: 2,
        mode: 'process',
        token: process.env.DISCORD_TOKEN
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
    }
};
