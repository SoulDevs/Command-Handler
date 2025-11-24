const fs = require('fs');
const path = require('path');
const logger = require('../utilities/Logger');

class ComponentHandler {
    constructor(client) {
        this.client = client;
        this.componentsPath = path.join(__dirname, '../modules/components');
    }

    async loadComponents() {
        if (!fs.existsSync(this.componentsPath)) {
            logger.warn('Components directory not found, creating...');
            fs.mkdirSync(this.componentsPath, { recursive: true });
            return;
        }

        const componentTypes = ['buttons', 'selectmenus', 'modals'];
        let totalLoaded = 0;

        for (const type of componentTypes) {
            const typePath = path.join(this.componentsPath, type);
            
            if (!fs.existsSync(typePath)) {
                fs.mkdirSync(typePath, { recursive: true });
                continue;
            }

            const componentFiles = fs.readdirSync(typePath).filter(file => file.endsWith('.js'));

            for (const file of componentFiles) {
                try {
                    const filePath = path.join(typePath, file);
                    const component = require(filePath);

                    if (type === 'buttons') {
                        this.client.registry.components.registerButton(component);
                    } else if (type === 'selectmenus') {
                        this.client.registry.components.registerSelectMenu(component);
                    } else if (type === 'modals') {
                        this.client.registry.components.registerModal(component);
                    }

                    totalLoaded++;
                    logger.debug(`Loaded ${type} component: ${file}`);
                } catch (error) {
                    logger.error(`Failed to load component ${file}:`, error);
                }
            }
        }

        logger.success(`Loaded ${totalLoaded} components (buttons, select menus, modals)`);
    }

    async handleButton(interaction) {
        const button = this.client.registry.components.getButton(interaction.customId);
        
        if (!button) {
            return interaction.reply({ 
                content: 'This button is not registered!', 
                ephemeral: true 
            });
        }

        try {
            logger.component(interaction.customId, interaction.user.tag, this.client.cluster?.id);
            await button.execute(interaction, this.client);
        } catch (error) {
            logger.error(`Error executing button ${interaction.customId}:`, error);
            
            const errorMessage = { 
                content: 'There was an error with this button!', 
                ephemeral: true 
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    async handleSelectMenu(interaction) {
        const selectMenu = this.client.registry.components.getSelectMenu(interaction.customId);
        
        if (!selectMenu) {
            return interaction.reply({ 
                content: 'This select menu is not registered!', 
                ephemeral: true 
            });
        }

        try {
            logger.component(interaction.customId, interaction.user.tag, this.client.cluster?.id);
            await selectMenu.execute(interaction, this.client);
        } catch (error) {
            logger.error(`Error executing select menu ${interaction.customId}:`, error);
            
            const errorMessage = { 
                content: 'There was an error with this select menu!', 
                ephemeral: true 
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }

    async handleModal(interaction) {
        const modal = this.client.registry.components.getModal(interaction.customId);
        
        if (!modal) {
            return interaction.reply({ 
                content: 'This modal is not registered!', 
                ephemeral: true 
            });
        }

        try {
            logger.component(interaction.customId, interaction.user.tag, this.client.cluster?.id);
            await modal.execute(interaction, this.client);
        } catch (error) {
            logger.error(`Error executing modal ${interaction.customId}:`, error);
            
            const errorMessage = { 
                content: 'There was an error with this modal!', 
                ephemeral: true 
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(errorMessage);
            } else {
                await interaction.reply(errorMessage);
            }
        }
    }
}

module.exports = ComponentHandler;
