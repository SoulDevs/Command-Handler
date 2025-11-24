const embedBuilder = require('../../../utilities/EmbedBuilder');

module.exports = {
    customId: 'mention_ping',
    
    async execute(interaction, client) {
        const originalUser = interaction.message.interaction?.user?.id || interaction.message.mentions.users?.first()?.id;
        
        if (!originalUser || interaction.user.id !== originalUser) {
            const embed = embedBuilder.error(
                'This button is not for you! Use the bot mention to get your own ping info.',
                'Access Denied'
            );
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        const embed = embedBuilder.create({
            title: '🏓 Pong!',
            description: `**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**`,
            fields: [
                {
                    name: '📡 Websocket Latency',
                    value: `\`${client.ws.ping}ms\``,
                    inline: true
                },
                {
                    name: '🖥️ Cluster ID',
                    value: `\`${client.cluster?.id || 0}\``,
                    inline: true
                },
                {
                    name: '🔢 Shard Count',
                    value: `\`${client.cluster?.count || 1}\``,
                    inline: true
                },
                {
                    name: '**━━━━━━━━━━━━━━━━━━━━━━━━━━━━**\n⏱️ API Latency',
                    value: `\`${Date.now() - interaction.createdTimestamp}ms\``,
                    inline: true
                },
                {
                    name: '💾 Memory Usage',
                    value: `\`${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB\``,
                    inline: true
                },
                {
                    name: '⏳ Uptime',
                    value: `\`${Math.floor(client.uptime / 1000 / 60)} minutes\``,
                    inline: true
                }
            ],
            footer: { 
                text: `${client.config.bot.name} • Cluster ${client.cluster?.id || 0}`,
                iconURL: client.user.displayAvatarURL()
            },
            color: 0x57F287
        });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
