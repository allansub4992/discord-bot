/**
 * Configuration Module
 * Manages environment variables and application constants
 */

// Load environment variables from .env file
require('dotenv').config()

// Bot Configuration
const config = {
  // Discord Bot Settings
  bot: {
    token: process.env.DISCORD_TOKEN,
    guildId: process.env.GUILD_ID,
    clientId: process.env.CLIENT_ID
  },

  // User Roles Configuration
  roles: {
    ownerIds: process.env.OWNER_IDS ? process.env.OWNER_IDS.split(',') : [],
    admin: process.env.ADMIN_ROLE || 'Admin',
    seller: process.env.SELLER_ROLE || 'Seller',
    buyer: process.env.BUYER_ROLE || 'Buyer',
    support: process.env.SUPPORT_ROLE || 'Support'
  },

  // Category Names for Tickets
  categories: {
    active: 'Active Tickets',
    closed: 'Closed Tickets',
    archive: 'Archived Tickets'
  },

  // Embed Default Settings
  embeds: {
    defaultColor: 0x00AE86,
    productColor: 0xFF6B6B,
    successColor: 0x2ECC71,
    warningColor: 0xF39C12,
    errorColor: 0xE74C3C
  },

  // Storage Configuration
  storage: {
    autoSaveInterval: 5 * 60 * 1000, // 5 minutes
    maxFieldLength: 1024,
    maxTitleLength: 256,
    maxDescriptionLength: 4096,
    maxFields: 25
  },

  // Validation
  validation: {
    hexColorRegex: /^[0-9A-F]{6}$/i,
    urlRegex: /^https?:\/\/.+/
  }
}

// Validation function
function validateConfig() {
  const required = ['bot.token', 'bot.guildId']
  const missing = []

  for (const key of required) {
    const value = key.split('.').reduce((obj, prop) => obj?.[prop], config)
    if (!value) {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    console.error('Missing required configuration:', missing.join(', '))
    console.error('Please check your environment variables:')
    console.error('- DISCORD_TOKEN: Your bot token')
    console.error('- GUILD_ID: The server ID where the bot operates')
    return false
  }

  return true
}

// Helper functions
function getStaffRoles() {
  return [config.roles.admin, config.roles.seller, config.roles.support]
}

function isValidHexColor(color) {
  if (!color) return false
  const hex = color.replace('#', '')
  return config.validation.hexColorRegex.test(hex)
}

function isValidURL(url) {
  if (!url) return false
  try {
    new URL(url)
    return config.validation.urlRegex.test(url)
  } catch {
    return false
  }
}

module.exports = {
  config,
  validateConfig,
  getStaffRoles,
  isValidHexColor,
  isValidURL
}