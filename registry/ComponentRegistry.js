const { Collection } = require('discord.js');

class ComponentRegistry {
    constructor() {
        this.buttons = new Collection();
        this.selectMenus = new Collection();
        this.modals = new Collection();
    }

    registerButton(button) {
        if (!button.customId || !button.execute) {
            throw new Error('Button must have customId and execute properties');
        }
        this.buttons.set(button.customId, button);
        return this;
    }

    registerSelectMenu(selectMenu) {
        if (!selectMenu.customId || !selectMenu.execute) {
            throw new Error('Select menu must have customId and execute properties');
        }
        this.selectMenus.set(selectMenu.customId, selectMenu);
        return this;
    }

    registerModal(modal) {
        if (!modal.customId || !modal.execute) {
            throw new Error('Modal must have customId and execute properties');
        }
        this.modals.set(modal.customId, modal);
        return this;
    }

    getButton(customId) {
        for (const [id, button] of this.buttons) {
            if (customId.startsWith(id)) {
                return button;
            }
        }
        return null;
    }

    getSelectMenu(customId) {
        for (const [id, menu] of this.selectMenus) {
            if (customId.startsWith(id)) {
                return menu;
            }
        }
        return null;
    }

    getModal(customId) {
        for (const [id, modal] of this.modals) {
            if (customId.startsWith(id)) {
                return modal;
            }
        }
        return null;
    }

    clear() {
        this.buttons.clear();
        this.selectMenus.clear();
        this.modals.clear();
    }
}

module.exports = ComponentRegistry;
