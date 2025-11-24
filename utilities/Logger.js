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
                
                // Beautiful Discord-themed info box - 70 character width
                const border = chalk.hex('#5865F2').bold('║');
                const topBorder = chalk.hex('#5865F2').bold('╔' + '═'.repeat(70) + '╗');
                const bottomBorder = chalk.hex('#5865F2').bold('╚' + '═'.repeat(70) + '╝');
                
                const createRow = (icon, label, value, valueColor) => {
                    const labelPart = `${icon} ${label}`.padEnd(20);
                    const separator = chalk.hex('#5865F2')('│');
                    const valuePart = chalk.hex(valueColor).bold(value);
                    const textLength = labelPart.length + 3 + value.length; // 3 for ' │ '
                    const padding = ' '.repeat(Math.max(0, 70 - textLength));
                    
                    return border + chalk.hex('#99AAB5')(`  ${labelPart} ${separator} `) + valuePart + padding + border;
                };
                
                console.log(topBorder);
                console.log(createRow('🤖', 'Bot Name', botName, '#FFFFFF'));
                console.log(createRow('👤', 'Owner', ownerName, '#FFFFFF'));
                console.log(createRow('📦', 'Version', version, '#FEE75C'));
                console.log(createRow('⚡', 'Framework', 'Discord.js v14', '#57F287'));
                console.log(createRow('🔀', 'Sharding', 'Hybrid-Sharding', '#FEE75C'));
                console.log(createRow('🌐', 'Total Shards', totalShards.toString(), '#99AAB5'));
                console.log(bottomBorder);
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
