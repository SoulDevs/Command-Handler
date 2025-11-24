const { ClusterClient } = require('discord-hybrid-sharding');
const NpgClient = require('./Client');

const client = new NpgClient(new ClusterClient(this));

client.cluster.on('ready', () => {
    client.logger.info('Cluster client ready', client.cluster.id);
});

client.initialize();
