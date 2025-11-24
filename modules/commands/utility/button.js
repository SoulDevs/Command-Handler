const { 
    SlashCommandBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    MessageFlags
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('button')
        .setDescription('Test button component v2 handler'),
    
    name: 'button',
    description: 'Test button components',
    aliases: ['btn', 'test'],
    
    async execute(interactionOrMessage, argsOrClient, clientOrUndefined) {
        const isSlash = interactionOrMessage.isChatInputCommand?.();
        
        const container = new ContainerBuilder();
        
        const header = new TextDisplayBuilder()
            .setContent('## 🔘 Button Component Test');
        container.addTextDisplayComponents(header);
        
        container.addSeparatorComponents(new SeparatorBuilder());
        
        const desc = new TextDisplayBuilder()
            .setContent('> Click the buttons below to test the Component v2 handler system!');
        container.addTextDisplayComponents(desc);

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

        container.addActionRowComponents(row);
        
        container.addSeparatorComponents(new SeparatorBuilder());
        const footer = new TextDisplayBuilder()
            .setContent('> Npg Bot • Component v2 Handler');
        container.addTextDisplayComponents(footer);

        if (isSlash) {
            await interactionOrMessage.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        } else {
            await interactionOrMessage.reply({ components: [container], flags: MessageFlags.IsComponentsV2 });
        }
    }
};
