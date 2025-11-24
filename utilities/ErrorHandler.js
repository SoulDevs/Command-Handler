const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
const embedBuilder = require('./EmbedBuilder');

class ErrorHandler {
    constructor(client) {
        this.client = client;
        this.logger = client?.logger || console;
    }

    async handleCommandError(error, interactionOrMessage, commandName, isSlash = false) {
        this.logger.error(`Error in command ${commandName}:`, error);

        const container = new ContainerBuilder();
        
        const header = new TextDisplayBuilder()
            .setContent('## ❌ Command Error');
        container.addTextDisplayComponents(header);
        
        container.addSeparatorComponents(new SeparatorBuilder());
        
        const errorText = new TextDisplayBuilder()
            .setContent(
                `> An error occurred while executing the command.\n\n` +
                `**Command:** \`${commandName}\`\n` +
                `**Error:** \`${error.message || 'Unknown error'}\`\n\n` +
                `> If this persists, please contact the bot owner.`
            );
        container.addTextDisplayComponents(errorText);

        try {
            if (isSlash) {
                if (interactionOrMessage.deferred || interactionOrMessage.replied) {
                    await interactionOrMessage.followUp({ 
                        components: [container], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                } else {
                    await interactionOrMessage.reply({ 
                        components: [container], 
                        flags: MessageFlags.IsComponentsV2,
                        ephemeral: true 
                    });
                }
            } else {
                await interactionOrMessage.reply({ 
                    components: [container], 
                    flags: MessageFlags.IsComponentsV2 
                });
            }
        } catch (replyError) {
            this.logger.error('Failed to send error message:', replyError);
        }
    }

    async handleComponentError(error, interaction, componentId) {
        this.logger.error(`Error in component ${componentId}:`, error);

        const response = embedBuilder.error(
            `An error occurred while processing this component.\n\n` +
            `**Component:** \`${componentId}\`\n` +
            `**Error:** \`${error.message || 'Unknown error'}\``,
            'Component Error'
        );

        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.followUp({ ...response, ephemeral: true });
            } else {
                await interaction.reply({ ...response, ephemeral: true });
            }
        } catch (replyError) {
            this.logger.error('Failed to send component error message:', replyError);
        }
    }

    async handleInteractionError(error, interaction) {
        this.logger.error('Error handling interaction:', error);

        const response = embedBuilder.error(
            `An error occurred while processing your interaction.\n\n` +
            `**Error:** \`${error.message || 'Unknown error'}\``,
            'Interaction Error'
        );

        try {
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ ...response, ephemeral: true });
            } else {
                await interaction.reply({ ...response, ephemeral: true });
            }
        } catch (replyError) {
            this.logger.error('Failed to send interaction error message:', replyError);
        }
    }

    handleEventError(error, eventName) {
        this.logger.error(`Error in event ${eventName}:`, error);
    }

    handleProcessError(error, type = 'unhandled') {
        this.logger.error(`${type} process error:`, error);
        
        if (type === 'uncaughtException') {
            this.logger.error('Uncaught Exception! Bot may crash...');
        } else if (type === 'unhandledRejection') {
            this.logger.error('Unhandled Promise Rejection!');
        }
    }

    async handlePermissionError(interactionOrMessage, isSlash, requiredPermission) {
        const container = new ContainerBuilder();
        
        const header = new TextDisplayBuilder()
            .setContent('## 🔒 Permission Denied');
        container.addTextDisplayComponents(header);
        
        container.addSeparatorComponents(new SeparatorBuilder());
        
        const errorText = new TextDisplayBuilder()
            .setContent(
                `> You do not have permission to use this command.\n\n` +
                `**Required Permission:** \`${requiredPermission}\`\n\n` +
                `> Contact an administrator if you believe this is a mistake.`
            );
        container.addTextDisplayComponents(errorText);

        try {
            if (isSlash) {
                await interactionOrMessage.reply({ 
                    components: [container], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            } else {
                await interactionOrMessage.reply({ 
                    components: [container], 
                    flags: MessageFlags.IsComponentsV2 
                });
            }
        } catch (error) {
            this.logger.error('Failed to send permission error:', error);
        }
    }

    async handleCooldownError(interactionOrMessage, isSlash, timeLeft) {
        const container = new ContainerBuilder();
        
        const header = new TextDisplayBuilder()
            .setContent('## ⏱️ Cooldown Active');
        container.addTextDisplayComponents(header);
        
        container.addSeparatorComponents(new SeparatorBuilder());
        
        const errorText = new TextDisplayBuilder()
            .setContent(
                `> Please wait before using this command again.\n\n` +
                `**Time Remaining:** \`${timeLeft.toFixed(1)} seconds\``
            );
        container.addTextDisplayComponents(errorText);

        try {
            if (isSlash) {
                await interactionOrMessage.reply({ 
                    components: [container], 
                    flags: MessageFlags.IsComponentsV2,
                    ephemeral: true 
                });
            } else {
                await interactionOrMessage.reply({ 
                    components: [container], 
                    flags: MessageFlags.IsComponentsV2 
                });
            }
        } catch (error) {
            this.logger.error('Failed to send cooldown error:', error);
        }
    }
}

module.exports = ErrorHandler;
