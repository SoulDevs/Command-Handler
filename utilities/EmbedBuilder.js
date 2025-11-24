const { EmbedBuilder } = require('discord.js');

class CustomEmbedBuilder {
    constructor() {
        this.defaultColor = 0x5865F2;
        this.successColor = 0x57F287;
        this.errorColor = 0xED4245;
        this.warningColor = 0xFEE75C;
    }

    create(options = {}) {
        const embed = new EmbedBuilder()
            .setColor(options.color || this.defaultColor)
            .setTimestamp();

        if (options.title) embed.setTitle(options.title);
        if (options.description) embed.setDescription(options.description);
        if (options.footer) embed.setFooter(options.footer);
        if (options.author) embed.setAuthor(options.author);
        if (options.thumbnail) embed.setThumbnail(options.thumbnail);
        if (options.image) embed.setImage(options.image);
        if (options.fields) embed.addFields(options.fields);

        return embed;
    }

    success(description, title = 'Success') {
        return this.create({
            title: `✅ ${title}`,
            description,
            color: this.successColor
        });
    }

    error(description, title = 'Error') {
        return this.create({
            title: `❌ ${title}`,
            description,
            color: this.errorColor
        });
    }

    warning(description, title = 'Warning') {
        return this.create({
            title: `⚠️ ${title}`,
            description,
            color: this.warningColor
        });
    }

    info(description, title = 'Information') {
        return this.create({
            title: `ℹ️ ${title}`,
            description,
            color: this.defaultColor
        });
    }
}

module.exports = new CustomEmbedBuilder();
