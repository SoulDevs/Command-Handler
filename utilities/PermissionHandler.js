const { PermissionFlagsBits } = require('discord.js');
const embedBuilder = require('./EmbedBuilder');

class PermissionHandler {
    constructor(client) {
        this.client = client;
        this.config = client.config;
    }

    isOwner(userId) {
        if (!this.config.bot.owners || this.config.bot.owners.length === 0) {
            return false;
        }
        return this.config.bot.owners.includes(userId);
    }

    hasPermission(member, permission) {
        if (!member || !member.permissions) return false;
        
        if (typeof permission === 'string') {
            return member.permissions.has(PermissionFlagsBits[permission]);
        }
        
        return member.permissions.has(permission);
    }

    hasRole(member, roleId) {
        if (!member || !member.roles) return false;
        return member.roles.cache.has(roleId);
    }

    hasAnyRole(member, roleIds) {
        if (!member || !member.roles || !Array.isArray(roleIds)) return false;
        return roleIds.some(roleId => member.roles.cache.has(roleId));
    }

    async checkPermissions(interactionOrMessage, permissionConfig = {}) {
        const isInteraction = interactionOrMessage.isChatInputCommand?.();
        const user = isInteraction ? interactionOrMessage.user : interactionOrMessage.author;
        const member = isInteraction ? interactionOrMessage.member : interactionOrMessage.member;
        const guild = isInteraction ? interactionOrMessage.guild : interactionOrMessage.guild;

        if (permissionConfig.ownerOnly && !this.isOwner(user.id)) {
            const embed = embedBuilder.error(
                'This command can only be used by the bot owner!',
                '❌ Owner Only'
            );
            
            if (isInteraction) {
                await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interactionOrMessage.reply({ embeds: [embed] });
            }
            return false;
        }

        if (permissionConfig.guildOnly && !guild) {
            const embed = embedBuilder.error(
                'This command can only be used in servers, not in DMs!',
                '❌ Server Only'
            );
            
            if (isInteraction) {
                await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
            } else {
                await interactionOrMessage.reply({ embeds: [embed] });
            }
            return false;
        }

        if (permissionConfig.userPermissions && guild && member) {
            for (const perm of permissionConfig.userPermissions) {
                if (!this.hasPermission(member, perm)) {
                    const permName = typeof perm === 'string' ? perm : Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === perm);
                    
                    const embed = embedBuilder.error(
                        `You need the **${permName}** permission to use this command!`,
                        '❌ Missing Permissions'
                    );
                    
                    if (isInteraction) {
                        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        await interactionOrMessage.reply({ embeds: [embed] });
                    }
                    return false;
                }
            }
        }

        if (permissionConfig.requiredRoles && guild && member) {
            if (!this.hasAnyRole(member, permissionConfig.requiredRoles)) {
                const embed = embedBuilder.error(
                    'You don\'t have the required role to use this command!',
                    '❌ Missing Role'
                );
                
                if (isInteraction) {
                    await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
                } else {
                    await interactionOrMessage.reply({ embeds: [embed] });
                }
                return false;
            }
        }

        if (permissionConfig.botPermissions && guild) {
            const botMember = guild.members.cache.get(this.client.user.id);
            
            for (const perm of permissionConfig.botPermissions) {
                if (!this.hasPermission(botMember, perm)) {
                    const permName = typeof perm === 'string' ? perm : Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === perm);
                    
                    const embed = embedBuilder.error(
                        `I need the **${permName}** permission to execute this command!`,
                        '❌ Bot Missing Permissions'
                    );
                    
                    if (isInteraction) {
                        await interactionOrMessage.reply({ embeds: [embed], ephemeral: true });
                    } else {
                        await interactionOrMessage.reply({ embeds: [embed] });
                    }
                    return false;
                }
            }
        }

        return true;
    }

    getPermissionNames(permissions) {
        if (!Array.isArray(permissions)) return [];
        
        return permissions.map(perm => {
            if (typeof perm === 'string') return perm;
            return Object.keys(PermissionFlagsBits).find(key => PermissionFlagsBits[key] === perm) || 'Unknown';
        });
    }
}

module.exports = PermissionHandler;
