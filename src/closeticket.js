/**
 * Close Ticket Command Module
 * Handles the /closeticket slash command
 */

const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { canManage } = require('./permissions')
const { closeTicket, getTicketCategories } = require('./ticket')
const { isTicketChannel } = require('./permissions')

// Define the close ticket command
const closeTicketCommand = new SlashCommandBuilder()
  .setName('closeticket')
  .setDescription('Menutup tiket saat ini')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

// Execute function for the close ticket command
async function executeCloseTicket(interaction) {
  const member = interaction.member
  const channel = interaction.channel
  const guild = interaction.guild

  try {
    // Check if user has permission
    if (!canManage(member)) {
      await interaction.reply({
        content: '❌ Hanya admin atau owner yang dapat menggunakan perintah ini.',
        flags: 64 // ephemeral flag
      })
      return
    }

    // Get ticket categories
    const categories = getTicketCategories(guild)
    
    // Check if current channel is a ticket channel
    if (!isTicketChannel(channel, categories)) {
      await interaction.reply({
        content: '❌ Perintah ini hanya dapat digunakan di dalam channel tiket.',
        flags: 64 // ephemeral flag
      })
      return
    }

    // Close the ticket using existing ticket module (with auto-archiving)
    const closeResult = await closeTicket(interaction, categories)
    
    if (closeResult.success) {
      // Success message is handled in closeTicket function
      console.log(`✅ Ticket ${channel.name} closed and auto-archived by ${interaction.user.tag}`)
    } else {
      await interaction.reply({
        content: `❌ Gagal menutup tiket: ${closeResult.message}`,
        flags: 64 // ephemeral flag
      })
    }
  } catch (error) {
    console.error('Error in closeticket command:', error)
    await interaction.reply({
      content: '❌ Terjadi kesalahan saat menutup tiket.',
      flags: 64 // ephemeral flag
    })
  }
}

module.exports = {
  data: closeTicketCommand,
  execute: executeCloseTicket,
  // Export for integration with commands module
  closeTicketCommand
}