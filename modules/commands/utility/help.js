const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
const embedBuilder = require('../../../utilities/EmbedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('View all available commands and information about the bot'),
    
    name: 'help',
    description: 'View all available commands',
    aliases: ['commands', 'h'],
    
    async execute(interaction, client) {
        const isSlash = interaction.isChatInputCommand?.();
        
        const embed = embedBuilder.create({
            title: '📚 Npg Bot - Help Menu',
            description: 'Welcome to Npg Bot! Here are all available commands:',
            fields: [
                {
                    name: '🛠️ Utility Commands',
                    value: '`/ping` - Check bot latency\n`/help` - Show this menu\n`/button` - Test button components',
                    inline: false
                },
                {
                    name: '📝 Prefix Commands',
                    value: `You can also use prefix commands with \`${client.config.bot.prefix}\`\nExample: \`${client.config.bot.prefix}ping\``,
                    inline: false
                },
                {
                    name: '⚡ Features',
                    value: '✅ Discord.js v14\n✅ Slash Commands\n✅ Prefix Commands\n✅ Component v2 Handler\n✅ Discord Hybrid Sharding',
                    inline: false
                },
                {
                    name: '📊 Bot Information',
                    value: `Servers: \`${client.guilds.cache.size}\`\nUsers: \`${client.users.cache.size}\`\nCluster: \`${client.cluster?.id || 0}\``,
                    inline: false
                }
            ],
            footer: { text: 'Made by Npg • Powered by Discord.js v14' },
            thumbnail: client.user.displayAvatarURL()
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('help_menu')
                    .setPlaceholder('Select a category')
                    .addOptions([
                        {
                            label: 'Utility',
                            description: 'View utility commands',
                            value: 'utility',
                            emoji: '🛠️'
                        },
                        {
                            label: 'About',
                            description: 'About the bot',
                            value: 'about',
                            emoji: 'ℹ️'
                        }
                    ])
            );

        if (isSlash) {
            await interaction.reply({ embeds: [embed], components: [row] });
        } else {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};
