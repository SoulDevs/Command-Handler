const { SlashCommandBuilder } = require('discord.js');
const embedBuilder = require('../../../utilities/EmbedBuilder');
const util = require('util');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('[OWNER ONLY] Execute JavaScript code (DANGEROUS - USE WITH CAUTION)')
        .addStringOption(option =>
            option.setName('code')
                .setDescription('The code to execute')
                .setRequired(true)
        ),
    
    name: 'eval',
    description: '[OWNER ONLY] Execute JavaScript code (DANGEROUS)',
    aliases: ['e', 'evaluate'],
    
    permissions: {
        ownerOnly: true
    },
    
    async execute(interactionOrMessage, argsOrClient, clientOrUndefined) {
        const isSlash = interactionOrMessage.isChatInputCommand?.();
        const client = isSlash ? argsOrClient : clientOrUndefined;
        
        if (!client.config.developer.enableEval) {
            const embed = embedBuilder.error(
                '⚠️ **EVAL COMMAND DISABLED**\n\nThis command is disabled for security reasons. It allows arbitrary code execution which can compromise your bot and server.\n\nTo enable it (NOT RECOMMENDED for production):\n1. Set `ENABLE_EVAL=true` in your .env file\n2. Only use in controlled, trusted environments\n3. Never enable in production deployments',
                '🔒 Security Protection Active'
            );
            if (isSlash) {
                return interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
            } else {
                return interactionOrMessage.reply({ embeds: [embed] });
            }
        }
        
        let code;
        if (isSlash) {
            code = interactionOrMessage.options.getString('code');
        } else {
            code = argsOrClient.join(' ');
        }

        if (!code) {
            const embed = embedBuilder.error('Please provide code to evaluate!', 'No Code Provided');
            if (isSlash) {
                return interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
            } else {
                return interactionOrMessage.reply({ embeds: [embed] });
            }
        }

        try {
            const clean = (text) => {
                if (typeof text !== 'string') {
                    text = util.inspect(text, { depth: 0 });
                }
                text = text.replace(/`/g, '`' + String.fromCharCode(8203))
                    .replace(/@/g, '@' + String.fromCharCode(8203));
                
                const tokenRegex = new RegExp(client.token.split('').join('[^]*?'), 'gi');
                text = text.replace(tokenRegex, '[TOKEN HIDDEN]');
                
                return text;
            };
            
            let evaled = eval(code);
            
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            evaled = clean(evaled);

            if (evaled.length > 1024) {
                evaled = evaled.substring(0, 1021) + '...';
            }

            const embed = embedBuilder.success(
                `\`\`\`js\n${evaled}\`\`\``,
                '✅ Evaluation Success'
            );

            embed.addFields({
                name: 'Input',
                value: `\`\`\`js\n${code.substring(0, 1000)}\`\`\``,
                inline: false
            });

            if (isSlash) {
                await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interactionOrMessage.reply({ embeds: [embed] });
            }
        } catch (error) {
            const embed = embedBuilder.error(
                `\`\`\`js\n${error.message?.substring(0, 1000) || 'Unknown error'}\`\`\``,
                '❌ Evaluation Error'
            );

            embed.addFields({
                name: 'Input',
                value: `\`\`\`js\n${code.substring(0, 1000)}\`\`\``,
                inline: false
            });

            if (isSlash) {
                await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interactionOrMessage.reply({ embeds: [embed] });
            }
        }
    }
};
