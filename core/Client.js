const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const CommandHandler = require('../handlers/CommandHandler');
const ComponentHandler = require('../handlers/ComponentHandler');
const EventHandler = require('../handlers/EventHandler');
const CommandRegistry = require('../registry/CommandRegistry');
const ComponentRegistry = require('../registry/ComponentRegistry');
const WebhookLogger = require('../utilities/WebhookLogger');
const PermissionHandler = require('../utilities/PermissionHandler');
const logger = require('../utilities/Logger');
const config = require('../config');

class NpgClient extends Client {
    constructor(cluster) {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates
            ],
            partials: [
                Partials.Channel,
                Partials.Message,
                Partials.User,
                Partials.GuildMember
            ],
            shards: cluster.ids,
            shardCount: cluster.count
        });

        this.cluster = cluster;
        this.config = config;
        this.logger = logger;
        
        this.webhookLogger = new WebhookLogger(this);
        this.permissionHandler = new PermissionHandler(this);
        
        this.registry = {
            commands: new CommandRegistry(),
            components: new ComponentRegistry()
        };

        this.handlers = {
            commands: new CommandHandler(this),
            components: new ComponentHandler(this),
            events: new EventHandler(this)
        };

        this.setupEventListeners();
    }

    setupEventListeners() {
        this.on('interactionCreate', async (interaction) => {
            try {
                if (interaction.isChatInputCommand()) {
                    await this.handlers.commands.handleSlashCommand(interaction);
                } else if (interaction.isButton()) {
                    await this.handlers.components.handleButton(interaction);
                } else if (interaction.isStringSelectMenu()) {
                    await this.handlers.components.handleSelectMenu(interaction);
                } else if (interaction.isModalSubmit()) {
                    await this.handlers.components.handleModal(interaction);
                }
            } catch (error) {
                logger.error('Error handling interaction:', error, this.cluster.id);
            }
        });

        this.on('messageCreate', async (message) => {
            try {
                await this.handlers.commands.handlePrefixCommand(message);
            } catch (error) {
                logger.error('Error handling message:', error, this.cluster.id);
            }
        });

        this.once('ready', () => {
            logger.shardReady(this.cluster.id, this.cluster.count);
            this.setPresence();
            
            if (this.config.webhooks.commandLog) {
                this.webhookLogger.setWebhookURL(this.config.webhooks.commandLog);
            }
            if (this.config.webhooks.shardLog) {
                this.webhookLogger.logShardReady(this.cluster.id, this.cluster.count, this.guilds.cache.size);
            }
        });
    }

    setPresence() {
        const activities = this.config.presence.activities;
        let current = 0;

        const updatePresence = () => {
            this.user.setPresence({
                status: this.config.presence.status,
                activities: [activities[current]]
            });
            current = (current + 1) % activities.length;
        };

        updatePresence();
        setInterval(updatePresence, 30000);
    }

    async initialize() {
        try {
            logger.printShardInfo(this.cluster.id, this.cluster.count);
            
            await this.handlers.commands.loadCommands();
            await this.handlers.components.loadComponents();
            await this.handlers.events.loadEvents();

            await this.login(this.config.bot.token);
        } catch (error) {
            logger.error('Failed to initialize client:', error, this.cluster.id);
            process.exit(1);
        }
    }
}

module.exports = NpgClient;
