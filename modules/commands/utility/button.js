const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const embedBuilder = require('../../../utilities/EmbedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('Test button component v2 handler'),
    
    name: 'button',
    description: 'Test button components',
    aliases: ['btn', 'test'],
    
    async execute(interaction, client) {
        const isSlash = interaction.isChatInputCommand?.();
        
        const embed = embedBuilder.create({
            title: '🔘 Button Component Test',
            description: 'Click the buttons below to test the component v2 handler!',
            footer: { text: 'Npg Bot • Component v2 Handler' }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('test_button_success')
                    .setLabel('Success')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('✅'),
                new ButtonBuilder()
                    .setCustomId('test_button_danger')
                    .setLabel('Danger')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('❌'),
                new ButtonBuilder()
                    .setCustomId('test_button_primary')
                    .setLabel('Primary')
                    .setStyle(ButtonStyle.Primary)
                    .setEmoji('🔵'),
                new ButtonBuilder()
                    .setLabel('Link Button')
                    .setStyle(ButtonStyle.Link)
                    .setURL('https://discord.js.org')
                    .setEmoji('🔗')
            );

        if (isSlash) {
            await interaction.reply({ embeds: [embed], components: [row] });
        } else {
            await interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};
