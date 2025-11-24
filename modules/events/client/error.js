const logger = require('../../../utilities/Logger');

module.exports = {
    name: 'error',
    once: false,
    
    async execute(error, client) {
        logger.error('Client error:', error, client.cluster?.id);
    }
};
