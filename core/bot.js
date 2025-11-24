const { ClusterClient } = require('discord-hybrid-sharding');
const { REST, Routes } = require('discord.js');
const NpgClient = require('./Client');
const fs = require('fs');
const path = require('path');

const client = new NpgClient(new ClusterClient(this));

client.cluster.on('ready', () => {
    client.logger.info('Cluster client ready', client.cluster.id);
});

async function deployCommands() {
    if (client.cluster.id !== 0) return;

    try {
        const commands = [];
        const commandsPath = path.join(__dirname, '../modules/commands');

        function loadCommandsRecursive(dir) {
            if (!fs.existsSync(dir)) return;
            
            const files = fs.readdirSync(dir);
            
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);
                
                if (stat.isDirectory()) {
                    loadCommandsRecursive(filePath);
                } else if (file.endsWith('.js')) {
                    try {
                        const command = require(filePath);
                        if (command.data) {
                            commands.push(command.data.toJSON());
                        }
                    } catch (error) {
                        client.logger.error(`Failed to load command ${file}:`, error);
                    }
                }
            }
        }

        loadCommandsRecursive(commandsPath);

        if (commands.length === 0) {
            client.logger.warn('No commands found to deploy');
            return;
        }

        const rest = new REST().setToken(client.config.bot.token);

        client.logger.info(`Deploying ${commands.length} slash commands...`, client.cluster.id);

        if (client.config.bot.testGuild) {
            await rest.put(
                Routes.applicationGuildCommands(client.config.bot.clientId, client.config.bot.testGuild),
                { body: commands }
            );
            client.logger.success(`Deployed ${commands.length} commands to test guild`, client.cluster.id);
        } else {
            await rest.put(
                Routes.applicationCommands(client.config.bot.clientId),
                { body: commands }
            );
            client.logger.success(`Deployed ${commands.length} commands globally`, client.cluster.id);
        }
    } catch (error) {
        client.logger.error('Failed to deploy commands:', error, client.cluster.id);
    }
}

client.once('ready', () => {
    deployCommands();
});

client.initialize();
