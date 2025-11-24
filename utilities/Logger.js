const chalk = require('chalk');
const ascii = require('ascii-art');

class Logger {
    constructor() {
        this.colors = {
            info: chalk.cyan,
            success: chalk.green,
            warn: chalk.yellow,
            error: chalk.red,
            debug: chalk.magenta,
            shard: chalk.blue,
            command: chalk.greenBright,
            component: chalk.yellowBright
        };
    }

    async printBanner(config) {
        return new Promise((resolve) => {
            const botName = config?.bot?.name || 'Npg';
            const ownerName = config?.bot?.owner || 'Npg';
            const version = config?.bot?.version || '1.0.0';
            const totalShards = config?.sharding?.totalShards || 'auto';
            
            // Use Doom font which is guaranteed to be available
            ascii.font(botName, 'Doom', (err, rendered) => {
                console.log('\n');
                
                if (!err && rendered) {
                    // Display ASCII art with beautiful gradient colors
                    const lines = rendered.split('\n').filter(line => line.trim());
                    lines.forEach((line, index) => {
                        // Gradient from Discord Blurple to lighter shades
                        const colors = ['#5865F2', '#6875F5', '#7885F7', '#8895FA', '#99AAB5'];
                        const colorIndex = Math.floor((index / lines.length) * colors.length);
                        console.log(chalk.hex(colors[colorIndex]).bold(line));
                    });
                }
                
                // Beautiful Discord-themed info box
                const boxWidth = 68;
                const createRow = (icon, label, separator, value, valueColor = '#FFFFFF') => {
                    const content = `  ${icon} ${label.padEnd(14)} ${separator} `;
                    const valueStr = chalk.hex(valueColor).bold(value);
                    const valueLen = value.length;
                    const padding = Math.max(0, boxWidth - content.length - valueLen - 2);
                    return chalk.hex('#5865F2').bold('║') + 
                           chalk.hex('#99AAB5')(content) + 
                           valueStr + 
                           ' '.repeat(padding) +
                           chalk.hex('#5865F2').bold('║');
                };
                
                console.log(chalk.hex('#5865F2').bold('╔' + '═'.repeat(boxWidth) + '╗'));
                console.log(createRow('🤖', 'Bot Name', chalk.hex('#5865F2')('│'), botName, '#FFFFFF'));
                console.log(createRow('👤', 'Owner', chalk.hex('#5865F2')('│'), ownerName, '#FFFFFF'));
                console.log(createRow('📦', 'Version', chalk.hex('#5865F2')('│'), version, '#FEE75C'));
                console.log(createRow('⚡', 'Framework', chalk.hex('#5865F2')('│'), 'Discord.js v14', '#57F287'));
                console.log(createRow('🔀', 'Sharding', chalk.hex('#5865F2')('│'), 'Hybrid-Sharding', '#FEE75C'));
                console.log(createRow('🌐', 'Total Shards', chalk.hex('#5865F2')('│'), totalShards.toString(), '#99AAB5'));
                console.log(chalk.hex('#5865F2').bold('╚' + '═'.repeat(boxWidth) + '╝'));
                console.log('\n');
                
                resolve();
            });
        });
    }

    printShardInfo(shardId, totalShards) {
        console.log(chalk.blue.bold(`\n[SHARD ${shardId}/${totalShards}]`) + chalk.blue(' Starting shard...'));
    }

    info(message, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[INFO]';
        console.log(`${this.colors.info(prefix)} ${message}`);
    }

    success(message, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[SUCCESS]';
        console.log(`${this.colors.success(prefix)} ${chalk.white(message)}`);
    }

    warn(message, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[WARN]';
        console.log(`${this.colors.warn(prefix)} ${message}`);
    }

    error(message, error = null, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[ERROR]';
        console.log(`${this.colors.error(prefix)} ${message}`);
        if (error) {
            console.log(this.colors.error(error.stack || error));
        }
    }

    debug(message, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[DEBUG]';
        console.log(`${this.colors.debug(prefix)} ${message}`);
    }

    command(commandName, user, guild, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[COMMAND]';
        console.log(`${this.colors.command(prefix)} ${chalk.white(commandName)} executed by ${chalk.yellow(user)} in ${chalk.cyan(guild)}`);
    }

    component(componentId, user, shard = null) {
        const prefix = shard !== null ? `[SHARD ${shard}]` : '[COMPONENT]';
        console.log(`${this.colors.component(prefix)} ${chalk.white(componentId)} used by ${chalk.yellow(user)}`);
    }

    shardReady(shardId, totalShards) {
        console.log(chalk.green.bold(`\n✓ [SHARD ${shardId}/${totalShards}] Ready!`));
    }

    clusterReady(clusterId, totalClusters) {
        console.log(chalk.green.bold(`\n✓ [CLUSTER ${clusterId}/${totalClusters}] All shards ready!`));
    }
}

module.exports = new Logger();
