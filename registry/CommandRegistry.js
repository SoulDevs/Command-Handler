const { Collection } = require('discord.js');

class CommandRegistry {
    constructor() {
        this.slashCommands = new Collection();
        this.prefixCommands = new Collection();
        this.aliases = new Collection();
    }

    registerSlash(command) {
        if (!command.data || !command.execute) {
            throw new Error('Command must have data and execute properties');
        }
        this.slashCommands.set(command.data.name, command);
        return this;
    }

    registerPrefix(command) {
        if (!command.name || !command.execute) {
            throw new Error('Command must have name and execute properties');
        }
        this.prefixCommands.set(command.name, command);
        
        if (command.aliases) {
            command.aliases.forEach(alias => {
                this.aliases.set(alias, command.name);
            });
        }
        return this;
    }

    getSlash(name) {
        return this.slashCommands.get(name);
    }

    getPrefix(name) {
        const command = this.prefixCommands.get(name);
        if (command) return command;
        
        const aliasCommand = this.aliases.get(name);
        if (aliasCommand) return this.prefixCommands.get(aliasCommand);
        
        return null;
    }

    getAllSlash() {
        return Array.from(this.slashCommands.values());
    }

    getAllPrefix() {
        return Array.from(this.prefixCommands.values());
    }

    clear() {
        this.slashCommands.clear();
        this.prefixCommands.clear();
        this.aliases.clear();
    }
}

module.exports = CommandRegistry;
