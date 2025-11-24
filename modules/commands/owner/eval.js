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
            const response = embedBuilder.error(
                '⚠️ **EVAL COMMAND DISABLED**\n\nThis command is disabled for security reasons. It allows arbitrary code execution which can compromise your bot and server.\n\nTo enable it (NOT RECOMMENDED for production):\n1. Set `ENABLE_EVAL=true` in your .env file\n2. Only use in controlled, trusted environments\n3. Never enable in production deployments',
                '🔒 Security Protection Active'
            );
            if (isSlash) {
                return interactionOrMessage.reply({ ...response, ephemeral: true });
            } else {
                return interactionOrMessage.reply(response);
            }
        }
        
        let code;
        if (isSlash) {
            code = interactionOrMessage.options.getString('code');
        } else {
            code = argsOrClient.join(' ');
        }

        if (!code) {
            const response = embedBuilder.error('Please provide code to evaluate!', 'No Code Provided');
            if (isSlash) {
                return interactionOrMessage.reply({ ...response, ephemeral: true });
            } else {
                return interactionOrMessage.reply(response);
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

            const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
            const container = new ContainerBuilder();
            
            const header = new TextDisplayBuilder()
                .setContent('## ✅ Evaluation Success');
            container.addTextDisplayComponents(header);
            container.addSeparatorComponents(new SeparatorBuilder());
            
            const inputText = new TextDisplayBuilder()
                .setContent(`**Input:**\n\`\`\`js\n${code.substring(0, 1000)}\`\`\``);
            container.addTextDisplayComponents(inputText);
            
            const outputText = new TextDisplayBuilder()
                .setContent(`**Output:**\n\`\`\`js\n${evaled}\`\`\``);
            container.addTextDisplayComponents(outputText);

            if (isSlash) {
                await interactionOrMessage.reply({ components: [container], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            } else {
                await interactionOrMessage.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
        } catch (error) {
            const { ContainerBuilder, TextDisplayBuilder, SeparatorBuilder, MessageFlags } = require('discord.js');
            const container = new ContainerBuilder();
            
            const header = new TextDisplayBuilder()
                .setContent('## ❌ Evaluation Error');
            container.addTextDisplayComponents(header);
            container.addSeparatorComponents(new SeparatorBuilder());
            
            const inputText = new TextDisplayBuilder()
                .setContent(`**Input:**\n\`\`\`js\n${code.substring(0, 1000)}\`\`\``);
            container.addTextDisplayComponents(inputText);
            
            const errorText = new TextDisplayBuilder()
                .setContent(`**Error:**\n\`\`\`js\n${error.message?.substring(0, 1000) || 'Unknown error'}\`\`\``);
            container.addTextDisplayComponents(errorText);

            if (isSlash) {
                await interactionOrMessage.reply({ components: [container], flags: MessageFlags.IsComponentsV2, ephemeral: true });
            } else {
                await interactionOrMessage.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
            }
        }
    }
};
