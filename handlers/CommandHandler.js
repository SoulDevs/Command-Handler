const fs = require('fs');
const path = require('path');
const logger = require('../utilities/Logger');

class CommandHandler {
    constructor(client) {
        this.client = client;
        this.commandsPath = path.join(__dirname, '../modules/commands');
    }

    async loadCommands() {
        if (!fs.existsSync(this.commandsPath)) {
            logger.warn('Commands directory not found, creating...');
            fs.mkdirSync(this.commandsPath, { recursive: true });
            return;
        }

        const categories = fs.readdirSync(this.commandsPath).filter(file => 
            fs.statSync(path.join(this.commandsPath, file)).isDirectory()
        );

        let slashCount = 0;
        let prefixCount = 0;

        for (const category of categories) {
            const categoryPath = path.join(this.commandsPath, category);
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                try {
                    const filePath = path.join(categoryPath, file);
                    const command = require(filePath);

                    if (command.data) {
                        this.client.registry.commands.registerSlash(command);
                        slashCount++;
                    }

                    if (command.name) {
                        this.client.registry.commands.registerPrefix(command);
                        prefixCount++;
                    }

                    logger.debug(`Loaded command: ${file} from ${category}`);
                } catch (error) {
                    logger.error(`Failed to load command ${file}:`, error);
                }
            }
        }

        logger.success(`Loaded ${slashCount} slash commands and ${prefixCount} prefix commands`);
    }

    async handleSlashCommand(interaction) {
        const command = this.client.registry.commands.getSlash(interaction.commandName);
        
        if (!command) {
            return interaction.reply({ 
                content: 'This command is not registered!', 
                ephemeral: true 
            });
        }

        try {
            logger.command(
                interaction.commandName, 
                interaction.user.tag, 
                interaction.guild?.name || 'DM',
                this.client.cluster?.id
            );
            await command.execute(interaction, this.client);
        } catch (error) {
            logger.error(`Error executing ${interaction.commandName}:`, error);
            
            const errorMessage = { 
                content: 'There was an error executing this command!', 
                ephemeral: true 
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    async handlePrefixCommand(message) {
        const prefix = this.client.config.bot.prefix;
        
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = this.client.registry.commands.getPrefix(commandName);
        
        if (!command) return;

        try {
            logger.command(
                commandName, 
                message.author.tag, 
                message.guild?.name || 'DM',
                this.client.cluster?.id
            );
            await command.execute(message, args, this.client);
        } catch (error) {
            logger.error(`Error executing ${commandName}:`, error);
            await message.reply('There was an error executing this command!');
        }
    }
}

module.exports = CommandHandler;
