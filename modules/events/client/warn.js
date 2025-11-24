const logger = require('../../../utilities/Logger');

module.exports = {
    name: 'warn',
    once: false,
    
    async execute(warning, client) {
        logger.warn(warning, client.cluster?.id);
    }
};
