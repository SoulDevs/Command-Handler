const fs = require('fs');
const path = require('path');
const logger = require('../utilities/Logger');

class EventHandler {
    constructor(client) {
        this.client = client;
        this.eventsPath = path.join(__dirname, '../modules/events');
    }

    async loadEvents() {
        if (!fs.existsSync(this.eventsPath)) {
            logger.warn('Events directory not found, creating...');
            fs.mkdirSync(this.eventsPath, { recursive: true });
            return;
        }

        const eventCategories = fs.readdirSync(this.eventsPath).filter(file => 
            fs.statSync(path.join(this.eventsPath, file)).isDirectory()
        );

        let eventCount = 0;

        for (const category of eventCategories) {
            const categoryPath = path.join(this.eventsPath, category);
            const eventFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            for (const file of eventFiles) {
                try {
                    const filePath = path.join(categoryPath, file);
                    const event = require(filePath);

                    if (!event.name || !event.execute) {
                        logger.warn(`Event ${file} is missing name or execute function`);
                        continue;
                    }

                    if (event.once) {
                        this.client.once(event.name, (...args) => event.execute(...args, this.client));
                    } else {
                        this.client.on(event.name, (...args) => event.execute(...args, this.client));
                    }

                    eventCount++;
                    logger.debug(`Loaded event: ${event.name} from ${category}`);
                } catch (error) {
                    logger.error(`Failed to load event ${file}:`, error);
                }
            }
        }

        logger.success(`Loaded ${eventCount} events`);
    }
}

module.exports = EventHandler;
