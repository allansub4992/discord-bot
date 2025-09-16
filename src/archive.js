/**
 * Archive Management Module
 * Handles archive viewing and management operations
 */

const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')
const { getArchivedTickets, getTicketsByCreator, getStorageInfo } = require('./storage')
const { canManage } = require('./permissions')

// Define the view archive command
const viewArchiveCommand = new SlashCommandBuilder()
  .setName('viewarchive')
  .setDescription('Lihat tiket yang telah diarsipkan')
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand(subcommand =>
    subcommand
      .setName('all')
      .setDescription('Lihat semua tiket yang diarsipkan')
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('user')
      .setDescription('Lihat tiket yang diarsipkan berdasarkan user')
      .addUserOption(option =>
        option
          .setName('user')
          .setDescription('User yang ingin dilihat arsip tiketnya')
          .setRequired(true)
      )
  )
  .addSubcommand(subcommand =>
    subcommand
      .setName('stats')
      .setDescription('Lihat statistik arsip tiket')
  )

// Execute function for the view archive command
async function executeViewArchive(interaction) {
  const member = interaction.member
  const subcommand = interaction.options.getSubcommand()

  try {
    // Check if user has permission
    if (!canManage(member)) {
      await interaction.reply({
        content: '❌ Hanya admin atau owner yang dapat menggunakan perintah ini.',
        flags: 64
      })
      return
    }

    await interaction.deferReply({ flags: 64 })

    switch (subcommand) {
      case 'all':
        await handleViewAllArchived(interaction)
        break
      case 'user':
        await handleViewUserArchived(interaction)
        break
      case 'stats':
        await handleViewArchiveStats(interaction)
        break
    }
  } catch (error) {
    console.error('Error in viewarchive command:', error)
    await interaction.editReply({
      content: '❌ Terjadi kesalahan saat mengakses arsip tiket.'
    })
  }
}

// Handle viewing all archived tickets
async function handleViewAllArchived(interaction) {
  const archivedTickets = getArchivedTickets()
  const ticketEntries = Object.entries(archivedTickets)

  if (ticketEntries.length === 0) {
    await interaction.editReply({
      content: '📝 Tidak ada tiket yang diarsipkan saat ini.'
    })
    return
  }

  // Sort by archived date (newest first)
  ticketEntries.sort((a, b) => new Date(b[1].archived_at) - new Date(a[1].archived_at))

  // Create pages for large lists
  const itemsPerPage = 10
  const totalPages = Math.ceil(ticketEntries.length / itemsPerPage)
  const currentPage = ticketEntries.slice(0, itemsPerPage)

  const embed = new EmbedBuilder()
    .setTitle('🗃️ Arsip Tiket - Semua Tiket')
    .setDescription(`Menampilkan ${Math.min(itemsPerPage, ticketEntries.length)} dari ${ticketEntries.length} tiket yang diarsipkan`)
    .setColor('#3498DB')
    .setTimestamp()

  let fieldCount = 0
  for (const [channelId, ticket] of currentPage) {
    if (fieldCount >= 25) break // Discord limit

    const archivedDate = new Date(ticket.archived_at).toLocaleString('id-ID')
    const type = ticket.type || 'general'
    const autoArchived = ticket.auto_archived ? '🤖 Otomatis' : '👤 Manual'

    embed.addFields({
      name: `${type.toUpperCase()} - ${ticket.channel_name}`,
      value: 
        `**Creator:** ${ticket.creator_tag}\n` +
        `**Channel ID:** ${channelId}\n` +
        `**Diarsipkan:** ${archivedDate}\n` +
        `**Jenis Arsip:** ${autoArchived}`,
      inline: true
    })
    fieldCount++
  }

  if (totalPages > 1) {
    embed.setFooter({ text: `Halaman 1 dari ${totalPages} | Gunakan /viewarchive all untuk melihat semua` })
  }

  await interaction.editReply({ embeds: [embed] })
}

// Handle viewing user-specific archived tickets
async function handleViewUserArchived(interaction) {
  const targetUser = interaction.options.getUser('user')
  const userTickets = getTicketsByCreator(targetUser.id)
  const archivedTickets = userTickets.filter(ticket => ticket.status === 'archived')

  if (archivedTickets.length === 0) {
    await interaction.editReply({
      content: `📝 Tidak ada tiket yang diarsipkan untuk user ${targetUser.tag}.`
    })
    return
  }

  const embed = new EmbedBuilder()
    .setTitle(`🗃️ Arsip Tiket - ${targetUser.tag}`)
    .setDescription(`Menampilkan ${archivedTickets.length} tiket yang diarsipkan`)
    .setColor('#9B59B6')
    .setThumbnail(targetUser.displayAvatarURL())
    .setTimestamp()

  let fieldCount = 0
  for (const ticket of archivedTickets.slice(0, 25)) { // Discord limit
    const archivedDate = new Date(ticket.archived_at).toLocaleString('id-ID')
    const createdDate = new Date(ticket.created_at).toLocaleString('id-ID')
    const type = ticket.type || 'general'
    const autoArchived = ticket.auto_archived ? '🤖 Otomatis' : '👤 Manual'

    embed.addFields({
      name: `${type.toUpperCase()} - ${ticket.channel_name}`,
      value: 
        `**Dibuat:** ${createdDate}\n` +
        `**Diarsipkan:** ${archivedDate}\n` +
        `**Channel ID:** ${ticket.channelId}\n` +
        `**Jenis Arsip:** ${autoArchived}`,
      inline: true
    })
    fieldCount++
  }

  await interaction.editReply({ embeds: [embed] })
}

// Handle viewing archive statistics
async function handleViewArchiveStats(interaction) {
  const storageInfo = getStorageInfo()
  const archivedTickets = getArchivedTickets()
  
  // Calculate additional stats
  const autoArchivedCount = Object.values(archivedTickets).filter(ticket => ticket.auto_archived).length
  const manualArchivedCount = Object.values(archivedTickets).filter(ticket => !ticket.auto_archived).length
  
  // Get recent archives (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentArchives = Object.values(archivedTickets).filter(ticket => 
    new Date(ticket.archived_at) > weekAgo
  ).length

  // Calculate storage sizes
  const totalStorageKB = Object.values(storageInfo.sizes).reduce((sum, size) => sum + size, 0) / 1024

  const embed = new EmbedBuilder()
    .setTitle('📊 Statistik Arsip Tiket')
    .setDescription('Informasi lengkap tentang sistem arsip tiket')
    .setColor('#E67E22')
    .addFields(
      {
        name: '🗃️ Total Arsip',
        value: `**${storageInfo.counts.archived_tickets}** tiket`,
        inline: true
      },
      {
        name: '🤖 Arsip Otomatis',
        value: `**${autoArchivedCount}** tiket`,
        inline: true
      },
      {
        name: '👤 Arsip Manual',
        value: `**${manualArchivedCount}** tiket`,
        inline: true
      },
      {
        name: '📈 Arsip Minggu Ini',
        value: `**${recentArchives}** tiket`,
        inline: true
      },
      {
        name: '🎫 Total Tiket Aktif',
        value: `**${storageInfo.counts.active_tickets}** tiket`,
        inline: true
      },
      {
        name: '🔒 Total Tiket Tertutup',
        value: `**${storageInfo.counts.closed_tickets}** tiket`,
        inline: true
      },
      {
        name: '💾 Ukuran Storage',
        value: `**${totalStorageKB.toFixed(2)}** KB`,
        inline: true
      },
      {
        name: '📁 File Tickets',
        value: `**${(storageInfo.sizes.tickets / 1024).toFixed(2)}** KB`,
        inline: true
      },
      {
        name: '🗂️ Data Directory',
        value: `\`${storageInfo.paths.dataDir}\``,
        inline: false
      }
    )
    .setFooter({ text: 'Data diperbarui secara real-time' })
    .setTimestamp()

  await interaction.editReply({ embeds: [embed] })
}

module.exports = {
  data: viewArchiveCommand,
  execute: executeViewArchive,
  // Export for integration with commands module
  viewArchiveCommand,
  handleViewAllArchived,
  handleViewUserArchived,
  handleViewArchiveStats
}