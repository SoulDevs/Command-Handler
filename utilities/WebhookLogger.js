const { EmbedBuilder } = require('discord.js');
const chalk = require('chalk');

class WebhookLogger {
    constructor(client) {
        this.client = client;
        this.webhookURL = null;
        this.queue = [];
        this.processing = false;
    }

    setWebhookURL(url) {
        if (!url || url === 'your_webhook_url_here') {
            this.webhookURL = null;
            return;
        }
        this.webhookURL = url;
        console.log(chalk.green('[WEBHOOK] Webhook logging enabled'));
    }

    async sendToWebhook(embed) {
        if (!this.webhookURL) return;

        try {
            const response = await fetch(this.webhookURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: `${this.client.user?.username || 'Bot'} Logger`,
                    avatar_url: this.client.user?.displayAvatarURL(),
                    embeds: [embed]
                })
            });

            if (!response.ok) {
                console.error(chalk.red(`[WEBHOOK ERROR] Status: ${response.status}`));
            }
        } catch (error) {
            console.error(chalk.red('[WEBHOOK ERROR]'), error.message);
        }
    }

    async logCommand(commandName, user, guild, type, success = true, error = null) {
        if (!this.webhookURL) return;

        const colors = {
            slash: 0x5865F2,
            prefix: 0x57F287,
            mention: 0xFEE75C
        };

        const embed = {
            title: success ? '✅ Command Executed' : '❌ Command Failed',
            color: success ? colors[type] || colors.slash : 0xED4245,
            fields: [
                {
                    name: '📝 Command',
                    value: `\`${commandName}\``,
                    inline: true
                },
                {
                    name: '👤 User',
                    value: `${user.tag}\n\`${user.id}\``,
                    inline: true
                },
                {
                    name: '🌐 Server',
                    value: guild ? `${guild.name}\n\`${guild.id}\`` : 'Direct Message',
                    inline: true
                },
                {
                    name: '⚡ Type',
                    value: type === 'slash' ? 'Slash Command' : type === 'prefix' ? 'Prefix Command' : 'Mention Command',
                    inline: true
                },
                {
                    name: '🖥️ Cluster',
                    value: `\`${this.client.cluster?.id || 0}\``,
                    inline: true
                },
                {
                    name: '⏰ Timestamp',
                    value: `<t:${Math.floor(Date.now() / 1000)}:F>`,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        };

        if (error) {
            embed.fields.push({
                name: '❌ Error',
                value: `\`\`\`js\n${error.message?.slice(0, 1000) || 'Unknown error'}\`\`\``,
                inline: false
            });
        }

        await this.sendToWebhook(embed);
    }

    async logError(errorTitle, errorMessage, context = {}) {
        if (!this.webhookURL) return;

        const embed = {
            title: `🚨 ${errorTitle}`,
            description: `\`\`\`js\n${errorMessage.slice(0, 2000)}\`\`\``,
            color: 0xED4245,
            fields: Object.keys(context).map(key => ({
                name: key,
                value: String(context[key]).slice(0, 1024),
                inline: true
            })),
            timestamp: new Date().toISOString(),
            footer: { text: `Cluster ${this.client.cluster?.id || 0}` }
        };

        await this.sendToWebhook(embed);
    }

    async logEvent(eventName, description, color = 0x5865F2) {
        if (!this.webhookURL) return;

        const embed = {
            title: `📡 ${eventName}`,
            description: description,
            color: color,
            timestamp: new Date().toISOString(),
            footer: { text: `Cluster ${this.client.cluster?.id || 0}` }
        };

        await this.sendToWebhook(embed);
    }

    async logShardReady(shardId, totalShards, guilds) {
        if (!this.webhookURL) return;

        const embed = {
            title: '🚀 Shard Ready',
            description: `Shard **${shardId}/${totalShards}** is now online and ready!`,
            color: 0x57F287,
            fields: [
                {
                    name: '📊 Guilds',
                    value: `\`${guilds}\` servers`,
                    inline: true
                },
                {
                    name: '🖥️ Cluster',
                    value: `\`${this.client.cluster?.id || 0}\``,
                    inline: true
                }
            ],
            timestamp: new Date().toISOString()
        };

        await this.sendToWebhook(embed);
    }
}

module.exports = WebhookLogger;
