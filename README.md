# Npg Discord Bot

A professional Discord bot built with **Discord.js v14**, featuring **Component v2 Handler** and **Discord-Hybrid-Sharding** for scalability.

## ✨ Features

- 🚀 **Discord.js v14** - Latest version with full support
- 🔄 **Discord-Hybrid-Sharding** - Automated sharding from the start
- 🎯 **Component v2 Handler** - Buttons, Select Menus, Modals
- ⚡ **Slash Commands** - Full slash command support
- 📝 **Prefix Commands** - Traditional prefix commands with aliases
- 🏷️ **@Mention Commands** - Use commands by mentioning the bot
- 🎨 **Colorful ASCII Logging** - Beautiful console output with cluster info
- 📁 **Unique File Structure** - Organized and maintainable codebase

## 📁 Project Structure

```
npg-discord-bot/
├── cluster.js                 # Main entry point (cluster manager)
├── core/
│   ├── bot.js                # Bot initialization
│   └── Client.js             # Extended Discord client
├── handlers/
│   ├── CommandHandler.js     # Command handler
│   ├── ComponentHandler.js   # Component v2 handler
│   └── EventHandler.js       # Event handler
├── modules/
│   ├── commands/             # Slash & prefix commands
│   │   └── utility/
│   ├── components/           # Component v2
│   │   ├── buttons/
│   │   ├── selectmenus/
│   │   └── modals/
│   └── events/               # Event listeners
│       └── client/
├── registry/
│   ├── CommandRegistry.js    # Command storage
│   └── ComponentRegistry.js  # Component storage
├── utilities/
│   ├── Logger.js             # Colorful ASCII logger
│   └── EmbedBuilder.js       # Embed helper
├── config.js                 # Bot configuration
└── deployCommands.js         # Deploy slash commands
```

## 🚀 Setup

### 1. Install Dependencies

Dependencies are already installed. If you need to reinstall:

```bash
npm install
```

### 2. Configure Environment Variables

You'll need to provide:
- `DISCORD_TOKEN` - Your Discord bot token
- `CLIENT_ID` - Your bot's client/application ID
- `PREFIX` - Command prefix (default: !)
- `OWNER_IDS` - Your Discord user ID (comma-separated for multiple)
- `TEST_GUILD_ID` - (Optional) Guild ID for testing slash commands

### 3. Deploy Slash Commands

```bash
npm run deploy
```

### 4. Start the Bot

```bash
npm start
```

## 📝 Commands

The bot supports **4 different ways** to execute commands:

### 1. Slash Commands
- `/ping` - Check bot latency and shard info
- `/help` - View all commands with interactive menu
- `/button` - Test button components

### 2. Prefix Commands
Use the configured prefix (default `!`):
- `!ping`
- `!help`
- `!button`

### 3. @Mention Commands
Mention the bot followed by the command:
- `@Npg ping`
- `@Npg help`
- `@Npg button`

### 4. Just @Mention
Simply mention the bot to see the prefix and usage info:
- `@Npg` - Shows helpful information about the bot

## 🎨 Component v2 Handler

The bot includes a complete component v2 handler supporting:

### Buttons
Located in `modules/components/buttons/`
- Custom ID pattern matching
- Interactive button responses

### Select Menus
Located in `modules/components/selectmenus/`
- String select menus
- Dynamic menu handling

### Modals
Located in `modules/components/modals/`
- Form submissions
- User input handling

## 🔧 Configuration

Edit `config.js` to customize:
- Sharding settings
- Bot presence
- Default colors
- Owner permissions

## 📊 Sharding

The bot uses **discord-hybrid-sharding** and automatically:
- Calculates optimal shard count
- Distributes shards across clusters
- Displays cluster/shard info in logs
- Handles shard lifecycle events

## 🎨 Logger Features

- Colorful ASCII banner with bot branding
- Shard and cluster status tracking
- Command and component usage logs
- Error handling with stack traces
- Different log levels (info, success, warn, error, debug)

## 👨‍💻 Author

**Npg**

## 📄 License

MIT License
