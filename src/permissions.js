/**
 * Permissions Module
 * Handles all permission checking and role management
 */

const { PermissionsBitField } = require('discord.js')
const { config, getStaffRoles } = require('./config')

// Helper function to check if a guild member is an owner
function isOwner(member) {
  return config.roles.ownerIds.includes(member.id)
}

// Helper function to check if a guild member is an admin
function isAdmin(member) {
  return member.roles.cache.some(role => role.name === config.roles.admin)
}

// Helper function to check if user has permission to manage tickets (owner or admin)
function canManage(member) {
  return isOwner(member) || isAdmin(member)
}

// Helper function to check if user has staff role
function hasStaffRole(member) {
  const staffRoles = getStaffRoles()
  return member.roles.cache.some(role => staffRoles.includes(role.name))
}

// Helper function to check if user can access tickets (creator, staff, or admin)
function canAccessTicket(member, ticketCreatorId) {
  return (
    member.id === ticketCreatorId ||
    hasStaffRole(member) ||
    isOwner(member)
  )
}

// Enhanced permission checking function
function checkBotPermissions(guild, channel = null) {
  const botMember = guild.members.me
  if (!botMember) return { error: 'Bot member not found in guild' }
  
  const serverPerms = {
    manageChannels: botMember.permissions.has(PermissionsBitField.Flags.ManageChannels),
    manageRoles: botMember.permissions.has(PermissionsBitField.Flags.ManageRoles),
    sendMessages: botMember.permissions.has(PermissionsBitField.Flags.SendMessages),
    readMessages: botMember.permissions.has(PermissionsBitField.Flags.ReadMessageHistory),
    viewChannels: botMember.permissions.has(PermissionsBitField.Flags.ViewChannel),
    manageMessages: botMember.permissions.has(PermissionsBitField.Flags.ManageMessages),
    administrator: botMember.permissions.has(PermissionsBitField.Flags.Administrator)
  }
  
  let channelPerms = null
  if (channel) {
    channelPerms = {
      manageChannels: botMember.permissionsIn(channel).has(PermissionsBitField.Flags.ManageChannels),
      manageRoles: botMember.permissionsIn(channel).has(PermissionsBitField.Flags.ManageRoles),
      sendMessages: botMember.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages),
      readMessages: botMember.permissionsIn(channel).has(PermissionsBitField.Flags.ReadMessageHistory),
      viewChannels: botMember.permissionsIn(channel).has(PermissionsBitField.Flags.ViewChannel),
      manageMessages: botMember.permissionsIn(channel).has(PermissionsBitField.Flags.ManageMessages)
    }
  }
  
  return { serverPerms, channelPerms, botMember }
}

// Check if bot has required permissions for ticket operations
function canBotManageTickets(guild, channel = null) {
  const permCheck = checkBotPermissions(guild, channel)
  
  if (permCheck.error) {
    return { canManage: false, error: permCheck.error }
  }
  
  const requiredServerPerms = ['manageChannels', 'manageRoles', 'sendMessages']
  const missingServerPerms = requiredServerPerms.filter(perm => !permCheck.serverPerms[perm])
  
  if (missingServerPerms.length > 0) {
    return {
      canManage: false,
      error: `Bot missing server permissions: ${missingServerPerms.join(', ')}`
    }
  }
  
  if (channel) {
    const requiredChannelPerms = ['manageChannels', 'sendMessages', 'viewChannels']
    const missingChannelPerms = requiredChannelPerms.filter(perm => !permCheck.channelPerms[perm])
    
    if (missingChannelPerms.length > 0) {
      return {
        canManage: false,
        error: `Bot missing channel permissions: ${missingChannelPerms.join(', ')}`
      }
    }
  }
  
  return { canManage: true }
}

// Check if bot can send messages in a channel
function canBotSendMessages(channel) {
  const guild = channel.guild
  const botMember = guild.members.me
  
  if (!botMember) {
    return { canSend: false, error: 'Bot member not found' }
  }
  
  const requiredPerms = [
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.ViewChannel
  ]
  
  const missingPerms = []
  requiredPerms.forEach(permission => {
    if (!botMember.permissionsIn(channel).has(permission)) {
      missingPerms.push(permission)
    }
  })
  
  if (missingPerms.length > 0) {
    const permissionNames = missingPerms.map(p => {
      switch(p) {
        case PermissionsBitField.Flags.SendMessages: return 'Send Messages'
        case PermissionsBitField.Flags.ViewChannel: return 'View Channel'
        case PermissionsBitField.Flags.ReadMessageHistory: return 'Read Message History'
        case PermissionsBitField.Flags.ManageMessages: return 'Manage Messages'
        default: return 'Unknown Permission'
      }
    })
    
    return {
      canSend: false,
      error: `Bot missing permissions: ${permissionNames.join(', ')}`
    }
  }
  
  return { canSend: true }
}

// Get permission overwrites for ticket channels
function getTicketPermissionOverwrites(guild, creatorId, ticketType = 'general') {
  const overwrites = []
  
  // Deny everyone
  overwrites.push({ id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] })
  
  // Allow creator
  overwrites.push({ 
    id: creatorId, 
    allow: [
      PermissionsBitField.Flags.ViewChannel, 
      PermissionsBitField.Flags.SendMessages, 
      PermissionsBitField.Flags.AttachFiles, 
      PermissionsBitField.Flags.ReadMessageHistory
    ] 
  })
  
  // Determine which staff roles to include based on ticket type
  let rolesToInclude = []
  switch (ticketType) {
    case 'order':
      rolesToInclude = [config.roles.seller, config.roles.admin]
      break
    case 'cs':
    case 'support':
      rolesToInclude = [config.roles.support, config.roles.admin]
      break
    default:
      rolesToInclude = [config.roles.support, config.roles.seller, config.roles.admin]
  }
  
  // Add staff roles
  rolesToInclude.forEach(roleName => {
    const role = guild.roles.cache.find(r => r.name === roleName)
    if (role) {
      overwrites.push({ 
        id: role.id, 
        allow: [
          PermissionsBitField.Flags.ViewChannel, 
          PermissionsBitField.Flags.SendMessages, 
          PermissionsBitField.Flags.AttachFiles, 
          PermissionsBitField.Flags.ReadMessageHistory
        ] 
      })
    }
  })
  
  return overwrites
}

// Check if user can close a specific ticket
function canCloseTicket(member, ticketCreatorId) {
  return (
    member.id === ticketCreatorId ||
    hasStaffRole(member) ||
    isOwner(member)
  )
}

// Check if user can rename a specific ticket
function canRenameTicket(member, ticketCreatorId) {
  return (
    member.id === ticketCreatorId ||
    hasStaffRole(member) ||
    isOwner(member)
  )
}

// Get user permission level
function getUserPermissionLevel(member) {
  if (isOwner(member)) return 'owner'
  if (isAdmin(member)) return 'admin'
  if (hasStaffRole(member)) return 'staff'
  return 'user'
}

// Check if user can edit embeds
function canEditEmbeds(member) {
  return canManage(member)
}

// Check if user can manage data
function canManageData(member) {
  return canManage(member)
}

// Validate ticket channel
function isTicketChannel(channel, categories) {
  return (
    channel?.parentId === categories.active?.id ||
    channel?.parentId === categories.closed?.id ||
    channel?.parentId === categories.archive?.id
  )
}

module.exports = {
  // Role checking
  isOwner,
  isAdmin,
  canManage,
  hasStaffRole,
  canAccessTicket,
  
  // Permission checking
  checkBotPermissions,
  canBotManageTickets,
  canBotSendMessages,
  
  // Ticket permissions
  getTicketPermissionOverwrites,
  canCloseTicket,
  canRenameTicket,
  isTicketChannel,
  
  // Feature permissions
  canEditEmbeds,
  canManageData,
  
  // Utility
  getUserPermissionLevel
}