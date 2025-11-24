const logger = require('../../../utilities/Logger');

module.exports = {
    name: 'ready',
    once: true,
    
    async execute(client) {
        logger.success(`Logged in as ${client.user.tag}`, client.cluster?.id);
        logger.info(`Serving ${client.guilds.cache.size} guilds with ${client.users.cache.size} users`, client.cluster?.id);
    }
};
