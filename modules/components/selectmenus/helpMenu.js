const embedBuilder = require('../../../utilities/EmbedBuilder');

module.exports = {
    customId: 'help_menu',
    
    async execute(interaction, client) {
        const value = interaction.values[0];
        
        let embed;
        
        if (value === 'utility') {
            embed = embedBuilder.create({
                title: '🛠️ Utility Commands',
                description: 'Here are all utility commands:',
                fields: [
                    {
                        name: '/ping',
                        value: 'Check bot latency and response time',
                        inline: false
                    },
                    {
                        name: '/help',
                        value: 'Show the help menu',
                        inline: false
                    },
                    {
                        name: '/button',
                        value: 'Test button components',
                        inline: false
                    }
                ],
                footer: { text: `Prefix: ${client.config.bot.prefix}` }
            });
        } else if (value === 'about') {
            embed = embedBuilder.create({
                title: 'ℹ️ About Npg Bot',
                description: 'A professional Discord bot built with Discord.js v14',
                fields: [
                    {
                        name: 'Bot Name',
                        value: 'Npg',
                        inline: true
                    },
                    {
                        name: 'Owner',
                        value: 'Npg',
                        inline: true
                    },
                    {
                        name: 'Version',
                        value: '2.0.0',
                        inline: true
                    },
                    {
                        name: 'Framework',
                        value: 'Discord.js v14',
                        inline: true
                    },
                    {
                        name: 'Sharding',
                        value: 'Discord-Hybrid-Sharding',
                        inline: true
                    },
                    {
                        name: 'Cluster',
                        value: `${client.cluster?.id || 0}`,
                        inline: true
                    }
                ],
                thumbnail: client.user.displayAvatarURL()
            });
        }

        await interaction.update({ embeds: [embed] });
    }
};
