import Noblox from "noblox.js";
import { changeNickname } from "../utils/miscFunctions.js";
export function hasRolePermission(member, permissionRole) {
    if (member.roles.highest.comparePositionTo(permissionRole) >= 0) {
        return true;
    }
    else {
        return false;
    }
}
export function hasRole(member, roleId) {
    const role = member.roles.cache.get(roleId);
    return role !== undefined;
}
export function isUser(member, userId) {
    return member.id === userId;
}
export function permissionsCheck(type, member, target, interaction) {
    switch (type) {
        case "rp":
            return hasRolePermission(member, target);
        case "r":
            return hasRole(member, target);
        case "u":
            return isUser(member, target);
        default:
            console.log('No valid Permission Type passed.');
            return false;
    }
}
export function hasTRUExcusedRole(member) {
    return member.roles.cache.some(role => role.name === "TRU Excused");
}
export function getHighestRole(member) {
    const rolesArray = [...member.roles.cache.values()].sort((a, b) => b.comparePositionTo(a));
    const highestRole = member.roles.highest;
    if (highestRole.name === "TRU Excused") {
        const excusedIndex = rolesArray.findIndex(role => role.name === "TRU Excused");
        if (excusedIndex !== -1 && excusedIndex < rolesArray.length - 1) {
            return rolesArray[excusedIndex + 1];
        }
    }
    return highestRole;
}
export async function updateRoles(guardsman, member, existingUserData, verificationBinds, commandRole, guild) {
    const roleCache = {};
    const allowedRoles = [];
    const removedRoles = [];
    const errors = [];
    let hasPermssion = true;
    if (hasRole(member, commandRole.id)) {
        hasPermssion = false;
    }
    if (hasPermssion) {
        // parse allowed roles
        for (const verificationBind of verificationBinds) {
            const bindData = JSON.parse(verificationBind.role_data);
            const type = bindData.type;
            try {
                switch (type) {
                    case "group":
                        const groupId = bindData.groupId;
                        const minimumRank = bindData.minRank;
                        const maxRank = bindData.maxRank;
                        let userRank = roleCache[groupId];
                        if (!userRank) {
                            userRank = await Noblox.getRankInGroup(groupId, parseInt(existingUserData.roblox_id));
                        }
                        if (userRank >= minimumRank && userRank <= maxRank) {
                            // Check if the member already has this role
                            if (hasRole(member, verificationBind.role_id)) {
                                break;
                            }
                            else {
                                allowedRoles.push(verificationBind);
                            }
                        }
                        else {
                            // User doesn't meet rank requirements, check if they have the role
                            if (hasRole(member, verificationBind.role_id)) {
                                // Role should be removed
                                removedRoles.push(verificationBind);
                            }
                        }
                        break;
                    case "user":
                        const userId = bindData.userId;
                        if (userId === existingUserData.discord_id) {
                            if (hasRole(member, verificationBind.role_id)) {
                                break;
                            }
                            else {
                                allowedRoles.push(verificationBind);
                            }
                        }
                        else {
                            // User doesn't meet rank requirements, check if they have the role
                            if (hasRole(member, verificationBind.role_id)) {
                                // Role should be removed
                                removedRoles.push(verificationBind);
                            }
                            break;
                        }
                    default:
                        errors.push(`Unknown bind type ${type}. Please contact Blue.`);
                }
            }
            catch (error) {
                errors.push(`Failed to apply a role. ${error}`);
            }
        }
        // ensure no allowed roles are in the removedRoles list
        for (const removedRole of removedRoles) {
            if (allowedRoles.includes(removedRole)) {
                removedRoles.splice(removedRoles.indexOf(removedRole), 1);
            }
        }
        // remove roles
        for (const removedRole of removedRoles) {
            const userRole = member.roles.resolve(removedRole.role_id);
            if (userRole) {
                try {
                    await member.roles.remove(removedRole.role_id);
                }
                catch (error) {
                    errors.push(error);
                }
            }
        }
        // add roles
        for (const allowedRole of allowedRoles) {
            const userRole = member.roles.resolve(allowedRole.role_id);
            if (!userRole) {
                const guildRole = guild.roles.resolve(allowedRole.role_id);
                if (!guildRole) {
                    errors.push(`Failed to find role for bind ${allowedRole.id}`);
                    continue;
                }
                try {
                    await member.roles.add(guildRole);
                }
                catch (error) {
                    errors.push(error);
                }
            }
        }
        const highestRole = getHighestRole(member);
        const newNickname = changeNickname(highestRole.name, existingUserData.username);
        if (!hasRole(member, commandRole.id)) {
            try {
                // Set the new nickname
                await member.setNickname(newNickname);
            }
            catch (error) {
                errors.push(`Failed to edit nickname: ${error}`);
            }
        }
        const updatedUserData = await guardsman.database.operator.update({
            where: {
                discord_id: existingUserData.discord_id
            }, data: {
                truRank: highestRole.name
            }
        });
        const rolesChanged = allowedRoles.length > 0 || removedRoles.length > 0;
        const result = {
            isAllowed: true,
            allowedRoles: allowedRoles,
            removedRoles: removedRoles,
            rolesChanged: rolesChanged,
            updatedUserData: updatedUserData,
            errors: errors
        };
        return result;
    }
    const result = {
        isAllowed: false,
        allowedRoles: allowedRoles,
        removedRoles: removedRoles,
        rolesChanged: null,
        updatedUserData: null,
        errors: errors
    };
    return result;
}
;
