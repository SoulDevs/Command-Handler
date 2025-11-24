const embedBuilder = require('../../../utilities/EmbedBuilder');

module.exports = {
    customId: 'test_button',
    
    async execute(interaction, client) {
        const buttonId = interaction.customId;
        
        let embed;
        
        if (buttonId.includes('success')) {
            embed = embedBuilder.success(
                `You clicked the **Success** button!\nUser: ${interaction.user.tag}\nCluster: ${client.cluster?.id || 0}`,
                'Success Button Clicked'
            );
        } else if (buttonId.includes('danger')) {
            embed = embedBuilder.error(
                `You clicked the **Danger** button!\nUser: ${interaction.user.tag}\nCluster: ${client.cluster?.id || 0}`,
                'Danger Button Clicked'
            );
        } else if (buttonId.includes('primary')) {
            embed = embedBuilder.info(
                `You clicked the **Primary** button!\nUser: ${interaction.user.tag}\nCluster: ${client.cluster?.id || 0}`,
                'Primary Button Clicked'
            );
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
};
