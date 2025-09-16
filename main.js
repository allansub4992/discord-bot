/**
 * Modular Discord Ticket Bot - Main Entry Point
 */

// Import Discord.js components
const { Client, GatewayIntentBits, Events } = require('discord.js')

// Import modular components
const { config, validateConfig } = require('./src/config')
const { initializeStorage, autoSaveData } = require('./src/storage')
const { registerCommands } = require('./src/commands')
const { prepareCategories } = require('./src/ticket')
const { handleInteraction } = require('./src/handlers')

// Validate configuration before starting
if (!validateConfig()) {
  process.exit(1)
}

// Initialize storage system
initializeStorage()

// Setup auto-save interval
setInterval(autoSaveData, config.storage.autoSaveInterval)

// Create the Discord client
const client = new Client({
  intents: [GatewayIntentBits.Guilds]
})

// Client ready event
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}`)
  
  try {
    const guild = await client.guilds.fetch(config.bot.guildId)
    await registerCommands(guild)
    await prepareCategories(guild)
    console.log('✅ Bot initialization completed successfully')
  } catch (error) {
    console.error('❌ Error during bot initialization:', error)
  }
})

// Interaction event handler
client.on(Events.InteractionCreate, handleInteraction)

// Global error handling
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  // Don't exit the process, just log the error
})

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  // For uncaught exceptions, we should exit gracefully
  console.log('Bot is shutting down due to uncaught exception...')
  process.exit(1)
})

// Discord client error handling
client.on('error', (error) => {
  console.error('Discord client error:', error)
})

// Login to Discord
client.login(config.bot.token).catch(error => {
  console.error('❌ Failed to login to Discord:', error)
  process.exit(1)
})