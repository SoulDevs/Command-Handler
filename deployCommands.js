require('dotenv').config();
const NpgRegistry = require('./registry/Npg');

async function deploy() {
    const success = await NpgRegistry.deployCommands(
        process.env.DISCORD_TOKEN,
        process.env.CLIENT_ID,
        process.env.TEST_GUILD_ID || null
    );

    if (!success) {
        process.exit(1);
    }
}

deploy();
