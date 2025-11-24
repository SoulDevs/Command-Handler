const fs = require('fs');
const path = require('path');
const logger = require('../utilities/Logger');
const embedBuilder = require('../utilities/EmbedBuilder');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

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

        if (command.permissions) {
            const hasPermission = await this.client.permissionHandler.checkPermissions(interaction, command.permissions);
            if (!hasPermission) {
                return;
            }
        }

        try {
            logger.command(
                interaction.commandName, 
                interaction.user.tag, 
                interaction.guild?.name || 'DM',
                this.client.cluster?.id
            );
            
            await command.execute(interaction, this.client);
            
            await this.client.webhookLogger.logCommand(
                interaction.commandName,
                interaction.user,
                interaction.guild,
                'slash',
                true
            );
        } catch (error) {
            logger.error(`Error executing ${interaction.commandName}:`, error);
            
            await this.client.webhookLogger.logCommand(
                interaction.commandName,
                interaction.user,
                interaction.guild,
                'slash',
                false,
                error
            );
            
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
        if (message.author.bot) return;

        const prefix = this.client.config.bot.prefix;
        const mentionPrefix = `<@${this.client.user.id}>`;
        const mentionPrefixNick = `<@!${this.client.user.id}>`;
        
        let args;
        let commandName;
        let usedMention = false;

        if (message.content.startsWith(prefix)) {
            args = message.content.slice(prefix.length).trim().split(/ +/);
            commandName = args.shift().toLowerCase();
        }
        else if (message.content.startsWith(mentionPrefix)) {
            usedMention = true;
            args = message.content.slice(mentionPrefix.length).trim().split(/ +/);
            commandName = args.shift()?.toLowerCase();
        }
        else if (message.content.startsWith(mentionPrefixNick)) {
            usedMention = true;
            args = message.content.slice(mentionPrefixNick.length).trim().split(/ +/);
            commandName = args.shift()?.toLowerCase();
        }
        else if (message.mentions.has(this.client.user.id)) {
            const content = message.content.replace(/<@!?\d+>/g, '').trim();
            if (!content) {
                const embed = embedBuilder.create({
                    title: `👋 Hey there, ${message.author.username}!`,
                    description: `**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n\nMy prefix is: \`${prefix}\`\n\nYou can use commands in multiple ways:`,
                    fields: [
                        {
                            name: '📝 Command Methods',
                            value: `> **Prefix:** \`${prefix}help\`\n> **Mention:** \`@${this.client.user.username} help\`\n> **Slash:** \`/help\``,
                            inline: false
                        },
                        {
                            name: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n🚀 Quick Start',
                            value: `Type \`${prefix}help\` or click the button below to see all commands!`,
                            inline: false
                        }
                    ],
                    thumbnail: this.client.user.displayAvatarURL({ size: 1024 }),
                    color: 0x5865F2,
                    footer: {
                        text: `${this.client.config.bot.name} • Cluster ${this.client.cluster?.id || 0}`,
                        iconURL: this.client.user.displayAvatarURL()
                    }
                });

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('mention_help')
                            .setLabel('View Commands')
                            .setStyle(ButtonStyle.Primary)
                            .setEmoji('📚'),
                        new ButtonBuilder()
                            .setLabel('Invite Bot')
                            .setStyle(ButtonStyle.Link)
                            .setURL(`https://discord.com/api/oauth2/authorize?client_id=${this.client.user.id}&permissions=8&scope=bot%20applications.commands`)
                            .setEmoji('➕'),
                        new ButtonBuilder()
                            .setCustomId('mention_ping')
                            .setLabel('Ping')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🏓')
                    );

                return message.reply({ embeds: [embed], components: [row] });
            }
            return;
        }
        else {
            return;
        }

        if (!commandName) return;

        const command = this.client.registry.commands.getPrefix(commandName);
        
        if (!command) return;

        if (command.permissions) {
            const hasPermission = await this.client.permissionHandler.checkPermissions(message, command.permissions);
            if (!hasPermission) {
                return;
            }
        }

        try {
            const logPrefix = usedMention ? `@${commandName}` : `${prefix}${commandName}`;
            const commandType = usedMention ? 'mention' : 'prefix';
            
            logger.command(
                logPrefix, 
                message.author.tag, 
                message.guild?.name || 'DM',
                this.client.cluster?.id
            );
            
            await command.execute(message, args, this.client);
            
            await this.client.webhookLogger.logCommand(
                commandName,
                message.author,
                message.guild,
                commandType,
                true
            );
        } catch (error) {
            logger.error(`Error executing ${commandName}:`, error);
            
            await this.client.webhookLogger.logCommand(
                commandName,
                message.author,
                message.guild,
                usedMention ? 'mention' : 'prefix',
                false,
                error
            );
            
            await message.reply('There was an error executing this command!');
        }
    }
}

module.exports = CommandHandler;
