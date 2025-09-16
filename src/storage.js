/**
 * Local Storage Module
 * Manages all data persistence and storage operations
 */

const fs = require('fs')
const path = require('path')

// Data storage paths
const DATA_DIR = path.join(__dirname, '..', 'data')
const EMBEDS_FILE = path.join(DATA_DIR, 'embeds.json')
const TICKETS_FILE = path.join(DATA_DIR, 'tickets.json')
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json')
const TEMPLATES_FILE = path.join(DATA_DIR, 'templates.json')

// Data stores
let embedsData = {}
let ticketsData = {}
let settingsData = {}
let templatesData = {}

// Utility functions
function loadJSON(filePath, defaultData = {}) {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8')
      return JSON.parse(data)
    }
    return defaultData
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error)
    return defaultData
  }
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
    return true
  } catch (error) {
    console.error(`Error saving ${filePath}:`, error)
    return false
  }
}

// Initialize storage system
function initializeStorage() {
  // Ensure data directory exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    console.log('Data directory created:', DATA_DIR)
  }

  // Initialize data stores
  embedsData = loadJSON(EMBEDS_FILE, {
    saved_embeds: {},
    templates: {},
    statistics: {
      total_created: 0,
      total_edited: 0,
      last_created: null
    }
  })

  ticketsData = loadJSON(TICKETS_FILE, {
    active_tickets: {},
    closed_tickets: {},
    archived_tickets: {},
    statistics: {
      total_created: 0,
      total_closed: 0,
      total_archived: 0
    }
  })

  settingsData = loadJSON(SETTINGS_FILE, {
    guild_settings: {},
    embed_defaults: {
      color: '00AE86',
      footer_text: 'Powered by Discord Bot',
      timestamp: true
    },
    ticket_settings: {
      auto_close_inactive: false,
      inactive_hours: 24,
      log_channel: null
    }
  })

  templatesData = loadJSON(TEMPLATES_FILE, {
    custom_templates: {},
    user_templates: {}
  })

  console.log('✅ Local storage system initialized successfully')
  console.log(`📁 Data directory: ${DATA_DIR}`)
  console.log(`💾 Loaded ${Object.keys(embedsData.saved_embeds).length} saved embeds`)
  console.log(`🎫 Loaded ${Object.keys(ticketsData.active_tickets).length} active tickets`)
  console.log(`🎨 Loaded ${Object.keys(templatesData.custom_templates).length} custom templates`)
}

// Embed storage functions
function saveEmbedData(messageId, embedConfig, authorId, channelId) {
  embedsData.saved_embeds[messageId] = {
    config: embedConfig,
    author_id: authorId,
    channel_id: channelId,
    created_at: new Date().toISOString(),
    edited_count: 0
  }
  embedsData.statistics.total_created++
  embedsData.statistics.last_created = new Date().toISOString()
  return saveJSON(EMBEDS_FILE, embedsData)
}

function updateEmbedData(messageId, newConfig) {
  if (embedsData.saved_embeds[messageId]) {
    embedsData.saved_embeds[messageId].config = newConfig
    embedsData.saved_embeds[messageId].edited_count++
    embedsData.saved_embeds[messageId].last_edited = new Date().toISOString()
    embedsData.statistics.total_edited++
    return saveJSON(EMBEDS_FILE, embedsData)
  }
  return false
}

function getEmbedData(messageId) {
  return embedsData.saved_embeds[messageId] || null
}

function getEmbedStats() {
  return embedsData.statistics
}

function getAllEmbeds() {
  return embedsData.saved_embeds
}

// Ticket storage functions
function saveTicketData(channelId, ticketInfo) {
  ticketsData.active_tickets[channelId] = {
    ...ticketInfo,
    created_at: new Date().toISOString()
  }
  ticketsData.statistics.total_created++
  return saveJSON(TICKETS_FILE, ticketsData)
}

function closeTicketData(channelId, closedBy) {
  const ticketInfo = ticketsData.active_tickets[channelId]
  if (ticketInfo) {
    ticketsData.closed_tickets[channelId] = {
      ...ticketInfo,
      closed_at: new Date().toISOString(),
      closed_by: closedBy
    }
    delete ticketsData.active_tickets[channelId]
    ticketsData.statistics.total_closed++
    return saveJSON(TICKETS_FILE, ticketsData)
  }
  return false
}

// Archive ticket data - moves from closed to archived
function archiveTicketData(channelId, archivedBy) {
  const ticketInfo = ticketsData.closed_tickets[channelId]
  if (ticketInfo) {
    ticketsData.archived_tickets[channelId] = {
      ...ticketInfo,
      archived_at: new Date().toISOString(),
      archived_by: archivedBy
    }
    delete ticketsData.closed_tickets[channelId]
    ticketsData.statistics.total_archived++
    return saveJSON(TICKETS_FILE, ticketsData)
  }
  return false
}

// Auto-archive ticket when closing (moved directly from active to archived)
function autoArchiveTicketData(channelId, closedBy) {
  const ticketInfo = ticketsData.active_tickets[channelId]
  if (ticketInfo) {
    const timestamp = new Date().toISOString()
    ticketsData.archived_tickets[channelId] = {
      ...ticketInfo,
      closed_at: timestamp,
      closed_by: closedBy,
      archived_at: timestamp,
      archived_by: closedBy,
      auto_archived: true
    }
    delete ticketsData.active_tickets[channelId]
    ticketsData.statistics.total_closed++
    ticketsData.statistics.total_archived++
    return saveJSON(TICKETS_FILE, ticketsData)
  }
  return false
}

function getTicketData(channelId) {
  return ticketsData.active_tickets[channelId] || 
         ticketsData.closed_tickets[channelId] || 
         ticketsData.archived_tickets[channelId] || null
}

function getTicketStats() {
  return ticketsData.statistics
}

function getAllTickets() {
  return {
    active: ticketsData.active_tickets,
    closed: ticketsData.closed_tickets,
    archived: ticketsData.archived_tickets
  }
}

// Get archived tickets specifically
function getArchivedTickets() {
  // Ensure storage is initialized
  if (!ticketsData || Object.keys(ticketsData).length === 0) {
    initializeStorage()
  }
  
  if (!ticketsData || !ticketsData.archived_tickets) {
    return {}
  }
  return ticketsData.archived_tickets
}

// Search tickets by creator ID
function getTicketsByCreator(creatorId) {
  const allTickets = []
  
  // Ensure ticketsData is properly initialized
  if (!ticketsData) {
    return allTickets
  }
  
  // Active tickets
  const activeTickets = ticketsData.active_tickets || {}
  Object.entries(activeTickets).forEach(([channelId, ticket]) => {
    if (ticket && ticket.creator_id === creatorId) {
      allTickets.push({ ...ticket, channelId, status: 'active' })
    }
  })
  
  // Closed tickets
  const closedTickets = ticketsData.closed_tickets || {}
  Object.entries(closedTickets).forEach(([channelId, ticket]) => {
    if (ticket && ticket.creator_id === creatorId) {
      allTickets.push({ ...ticket, channelId, status: 'closed' })
    }
  })
  
  // Archived tickets
  const archivedTickets = ticketsData.archived_tickets || {}
  Object.entries(archivedTickets).forEach(([channelId, ticket]) => {
    if (ticket && ticket.creator_id === creatorId) {
      allTickets.push({ ...ticket, channelId, status: 'archived' })
    }
  })
  
  return allTickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

// Template storage functions
function saveCustomTemplate(name, template, authorId) {
  templatesData.custom_templates[name] = {
    ...template,
    author_id: authorId,
    created_at: new Date().toISOString()
  }
  return saveJSON(TEMPLATES_FILE, templatesData)
}

function getCustomTemplate(name) {
  return templatesData.custom_templates[name] || null
}

function deleteCustomTemplate(name) {
  if (templatesData.custom_templates[name]) {
    delete templatesData.custom_templates[name]
    return saveJSON(TEMPLATES_FILE, templatesData)
  }
  return false
}

function getAllTemplates() {
  return templatesData.custom_templates
}

// Settings storage functions
function updateSettings(category, settings) {
  settingsData[category] = { ...settingsData[category], ...settings }
  return saveJSON(SETTINGS_FILE, settingsData)
}

function getSettings(category = null) {
  return category ? settingsData[category] : settingsData
}

// Data management functions
function autoSaveData() {
  saveJSON(EMBEDS_FILE, embedsData)
  saveJSON(TICKETS_FILE, ticketsData)
  saveJSON(SETTINGS_FILE, settingsData)
  saveJSON(TEMPLATES_FILE, templatesData)
}

function clearData(type) {
  switch (type) {
    case 'embeds':
      embedsData = {
        saved_embeds: {},
        templates: {},
        statistics: { total_created: 0, total_edited: 0, last_created: null }
      }
      return saveJSON(EMBEDS_FILE, embedsData)
      
    case 'tickets':
      ticketsData = {
        active_tickets: {},
        closed_tickets: {},
        archived_tickets: {},
        statistics: { total_created: 0, total_closed: 0, total_archived: 0 }
      }
      return saveJSON(TICKETS_FILE, ticketsData)
      
    case 'templates':
      templatesData = {
        custom_templates: {},
        user_templates: {}
      }
      return saveJSON(TEMPLATES_FILE, templatesData)
      
    case 'settings':
      settingsData = {
        guild_settings: {},
        embed_defaults: { color: '00AE86', footer_text: 'Powered by Discord Bot', timestamp: true },
        ticket_settings: { auto_close_inactive: false, inactive_hours: 24, log_channel: null }
      }
      return saveJSON(SETTINGS_FILE, settingsData)
      
    case 'all':
      const results = [
        clearData('embeds'),
        clearData('tickets'),
        clearData('templates'),
        clearData('settings')
      ]
      return results.every(result => result)
      
    default:
      return false
  }
}

function createBackup() {
  return {
    timestamp: new Date().toISOString(),
    version: '1.0',
    embeds: embedsData,
    tickets: ticketsData,
    settings: settingsData,
    templates: templatesData
  }
}

function getStorageInfo() {
  // Ensure storage is initialized
  if (!ticketsData || Object.keys(ticketsData).length === 0) {
    initializeStorage()
  }
  
  const getFileSize = (filePath) => {
    try {
      return fs.statSync(filePath).size
    } catch {
      return 0
    }
  }

  // Ensure data objects are properly initialized
  const safeEmbedsData = embedsData || { saved_embeds: {} }
  const safeTicketsData = ticketsData || { active_tickets: {}, closed_tickets: {}, archived_tickets: {} }
  const safeTemplatesData = templatesData || { custom_templates: {} }

  return {
    sizes: {
      embeds: getFileSize(EMBEDS_FILE),
      tickets: getFileSize(TICKETS_FILE),
      templates: getFileSize(TEMPLATES_FILE),
      settings: getFileSize(SETTINGS_FILE)
    },
    counts: {
      saved_embeds: Object.keys(safeEmbedsData.saved_embeds || {}).length,
      active_tickets: Object.keys(safeTicketsData.active_tickets || {}).length,
      closed_tickets: Object.keys(safeTicketsData.closed_tickets || {}).length,
      archived_tickets: Object.keys(safeTicketsData.archived_tickets || {}).length,
      custom_templates: Object.keys(safeTemplatesData.custom_templates || {}).length
    },
    paths: {
      dataDir: DATA_DIR,
      embeds: EMBEDS_FILE,
      tickets: TICKETS_FILE,
      templates: TEMPLATES_FILE,
      settings: SETTINGS_FILE
    }
  }
}

module.exports = {
  // Initialization
  initializeStorage,
  autoSaveData,
  
  // Embed functions
  saveEmbedData,
  updateEmbedData,
  getEmbedData,
  getEmbedStats,
  getAllEmbeds,
  
  // Ticket functions
  saveTicketData,
  closeTicketData,
  archiveTicketData,
  autoArchiveTicketData,
  getTicketData,
  getTicketStats,
  getAllTickets,
  getArchivedTickets,
  getTicketsByCreator,
  
  // Template functions
  saveCustomTemplate,
  getCustomTemplate,
  deleteCustomTemplate,
  getAllTemplates,
  
  // Settings functions
  updateSettings,
  getSettings,
  
  // Data management
  clearData,
  createBackup,
  getStorageInfo
}