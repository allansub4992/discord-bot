/**
 * Ticket Management Module
 * Handles all ticket-related operations
 */

const { ChannelType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { config } = require('./config')
const { saveTicketData, closeTicketData, autoArchiveTicketData, archiveTicketData } = require('./storage')
const { 
  canBotManageTickets, 
  getTicketPermissionOverwrites, 
  canCloseTicket, 
  canRenameTicket,
  isTicketChannel,
  canManage
} = require('./permissions')

// Prepare ticket categories
async function prepareCategories(guild) {
  const activeName = config.categories.active
  const closedName = config.categories.closed
  const archiveName = config.categories.archive

  // Fetch existing categories
  const existing = {
    active: null,
    closed: null,
    archive: null
  }

  guild.channels.cache.forEach(ch => {
    if (ch.type === ChannelType.GuildCategory) {
      if (ch.name === activeName) existing.active = ch
      if (ch.name === closedName) existing.closed = ch
      if (ch.name === archiveName) existing.archive = ch
    }
  })

  // Create categories if missing
  if (!existing.active) {
    existing.active = await guild.channels.create({ 
      name: activeName, 
      type: ChannelType.GuildCategory, 
      reason: 'Ticket system setup' 
    })
  }
  if (!existing.closed) {
    existing.closed = await guild.channels.create({ 
      name: closedName, 
      type: ChannelType.GuildCategory, 
      reason: 'Ticket system setup' 
    })
  }
  if (!existing.archive) {
    existing.archive = await guild.channels.create({ 
      name: archiveName, 
      type: ChannelType.GuildCategory, 
      reason: 'Ticket system setup' 
    })
  }

  return existing
}

// Setup ticket creation channel
async function setupTicketChannel(channel) {
  const permCheck = canBotManageTickets(channel.guild, channel)
  
  if (!permCheck.canManage) {
    throw new Error(permCheck.error)
  }

  const embed = new EmbedBuilder()
    .setTitle('🎫 Buat Tiket Support')
    .setDescription(
      '**Butuh bantuan? Buat tiket support!**\n\n' +
      '• Klik tombol di bawah untuk membuat tiket pribadi\n' +
      '• Tim support kami akan membantu Anda dengan cepat\n' +
      '• Hanya Anda dan tim support yang dapat melihat tiket ini\n\n' +
      '**Apa yang bisa kami bantu?**\n' +
      '• Dukungan teknis\n' +
      '• Masalah akun\n' +
      '• Pertanyaan umum\n' +
      '• Laporan bug'
    )
    .setColor(config.embeds.defaultColor)
    .setFooter({ text: 'Klik tombol di bawah untuk memulai!' })

  const button = new ButtonBuilder()
    .setCustomId('create_ticket')
    .setLabel('🎫 Buat Tiket')
    .setStyle(ButtonStyle.Primary)

  const row = new ActionRowBuilder().addComponents(button)

  // Clear the channel messages (if bot has permission)
  try {
    const botMember = channel.guild.members.me
    if (botMember.permissionsIn(channel).has('ManageMessages')) {
      const messages = await channel.messages.fetch({ limit: 100 })
      if (messages.size > 0) {
        await channel.bulkDelete(messages.filter(msg => 
          msg.createdTimestamp > Date.now() - 14 * 24 * 60 * 60 * 1000
        ))
      }
    }
  } catch (error) {
    console.log('Could not clear channel messages:', error.message)
  }
  
  await channel.send({
    embeds: [embed],
    components: [row]
  })

  return true
}

// Create a new ticket
async function createTicket(interaction, ticketType = 'general') {
  const guild = interaction.guild
  const categories = await prepareCategories(guild)

  // Check if user already has an active ticket
  const existingChannel = guild.channels.cache.find(ch => 
    ch.parentId === categories.active?.id && 
    ch.topic === interaction.user.id &&
    (ticketType === 'general' || ch.name.includes(ticketType))
  )
  
  if (existingChannel) {
    return {
      success: false,
      message: `Anda sudah memiliki tiket ${ticketType} yang aktif: ${existingChannel}`,
      ephemeral: true
    }
  }

  // Check bot permissions
  const permCheck = canBotManageTickets(guild)
  if (!permCheck.canManage) {
    return {
      success: false,
      message: `Bot tidak memiliki izin yang diperlukan: ${permCheck.error}`,
      ephemeral: true
    }
  }

  // Get permission overwrites
  const overwrites = getTicketPermissionOverwrites(guild, interaction.user.id, ticketType)

  // Create unique channel name
  const prefix = ticketType === 'general' ? 'ticket' : ticketType
  const channelName = `${prefix}-${interaction.user.username.toLowerCase()}-${
    interaction.user.discriminator || interaction.user.id.slice(-4)
  }`.replace(/[^a-z0-9\-]/g, '')
  
  try {
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categories.active,
      topic: interaction.user.id,
      permissionOverwrites: overwrites,
      reason: `${ticketType} ticket created by ${interaction.user.tag}`
    })

    // Create welcome embed and action buttons
    const welcomeEmbed = createTicketWelcomeEmbed(interaction.user, channel, ticketType)
    const actionButtons = createTicketActionButtons(ticketType)
    
    const messageOptions = {
      content: `${interaction.user}`,
      embeds: [welcomeEmbed]
    }
    
    if (actionButtons) {
      messageOptions.components = [actionButtons]
    }
    
    await channel.send(messageOptions)
    
    // Save ticket data to local storage
    saveTicketData(channel.id, {
      creator_id: interaction.user.id,
      creator_tag: interaction.user.tag,
      channel_name: channelName,
      category: 'active',
      type: ticketType
    })
    
    return {
      success: true,
      message: `Tiket ${ticketType} Anda telah dibuat: ${channel}`,
      channel: channel,
      ephemeral: true
    }
  } catch (error) {
    console.error('Error creating ticket:', error)
    return {
      success: false,
      message: `Gagal membuat tiket: ${error.message}. Silakan hubungi administrator.`,
      ephemeral: true
    }
  }
}

// Create welcome embed for different ticket types
function createTicketWelcomeEmbed(user, channel, ticketType) {
  const embeds = {
    general: {
      title: '🎫 Tiket Berhasil Dibuat',
      description: `Selamat datang ${user}!\n\n` +
        '**Tiket Anda telah berhasil dibuat.**\n' +
        'Silakan jelaskan masalah Anda dan tim support kami akan segera membantu.',
      color: config.embeds.defaultColor
    },
    order: {
      title: '🛒 Tiket Pemesanan Dibuat',
      description: `Selamat datang ${user}!\n\n` +
        '**Tiket pemesanan Anda telah berhasil dibuat.**\n' +
        'Silakan jelaskan produk yang ingin Anda beli dan tim seller kami akan membantu proses pemesanan.',
      color: config.embeds.productColor
    },
    cs: {
      title: '🎧 Tiket Customer Service Dibuat',
      description: `Selamat datang ${user}!\n\n` +
        '**Tiket Customer Service Anda telah berhasil dibuat.**\n' +
        'Silakan jelaskan pertanyaan atau masalah Anda dan tim CS kami akan membantu menyelesaikannya.',
      color: config.embeds.defaultColor
    }
  }

  const embedData = embeds[ticketType] || embeds.general
  
  return new EmbedBuilder()
    .setTitle(embedData.title)
    .setDescription(embedData.description + `\n\n**Informasi Tiket:**\n` +
      `• ${ticketType === 'order' ? 'Pembeli' : ticketType === 'cs' ? 'Customer' : 'Pembuat Tiket'}: ${user.tag}\n` +
      `• Dibuat: <t:${Math.floor(Date.now() / 1000)}:F>\n` +
      `• Channel: ${channel}\n` +
      `• Jenis: ${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)}`
    )
    .setColor(embedData.color)
    .setThumbnail(user.displayAvatarURL())
    .setFooter({ 
      text: ticketType === 'order' ? 'Tim seller kami akan segera membantu Anda' :
            ticketType === 'cs' ? 'Tim Customer Service kami siap membantu' :
            'Tim support kami akan segera membantu Anda'
    })
}

// Create action buttons for tickets
function createTicketActionButtons(ticketType) {
  const buttons = []
  
  if (ticketType === 'order') {
    // For order tickets, add close order button
    const closeOrderButton = new ButtonBuilder()
      .setCustomId('close_order_ticket')
      .setLabel('🔒 Tutup Pesanan')
      .setStyle(ButtonStyle.Danger)
    
    buttons.push(closeOrderButton)
  }
  
  if (buttons.length > 0) {
    return new ActionRowBuilder().addComponents(...buttons)
  }
  
  return null
}

// Close a ticket with auto-archiving
async function closeTicket(interaction, categories) {
  const channel = interaction.channel
  
  // Check if it's a ticket channel
  if (!isTicketChannel(channel, categories)) {
    return {
      success: false,
      message: 'Perintah ini harus dijalankan di dalam saluran tiket.',
      ephemeral: true
    }
  }
  
  // Check permissions - only admins can close tickets
  if (!canManage(interaction.member)) {
    return {
      success: false,
      message: 'Hanya admin yang dapat menutup tiket.',
      ephemeral: true
    }
  }
  
  // Check bot permissions
  const permCheck = canBotManageTickets(interaction.guild, channel)
  if (!permCheck.canManage) {
    return {
      success: false,
      message: `Bot tidak memiliki izin yang diperlukan: ${permCheck.error}`,
      ephemeral: true
    }
  }
  
  try {
    // Defer the reply to prevent timeout and avoid multiple replies
    await interaction.deferReply({ ephemeral: true })
    
    // Step 1: Move to archive category (auto-archive)
    await channel.edit({ 
      parent: categories.archive,
      reason: `Ticket closed and auto-archived by ${interaction.user.tag}` 
    })
    
    // Step 2: Rename channel with archived prefix
    const newName = `archived-${channel.name.replace(/^(ticket-|closed-|archived-)/, '')}`
    await channel.edit({ 
      name: newName,
      reason: `Ticket renamed during auto-archive by ${interaction.user.tag}` 
    })
    
    // Step 3: Update permissions to remove send access for creator
    const creatorId = channel.topic
    if (creatorId) {
      await channel.permissionOverwrites.edit(creatorId, {
        SendMessages: false
      }, { reason: `Remove send permission - ticket auto-archived by ${interaction.user.tag}` })
    }
    
    // Step 4: Auto-archive ticket data in local storage
    const archiveResult = autoArchiveTicketData(channel.id, interaction.user.id)
    if (!archiveResult) {
      console.warn('Failed to save ticket data to local storage')
    }
    
    // Send the confirmation message
    await interaction.editReply({ 
      content: 'Tiket telah ditutup dan secara otomatis diarsipkan ke local storage.' 
    })
    
    const archiveEmbed = new EmbedBuilder()
      .setTitle('🗃️ Tiket Diarsipkan Otomatis')
      .setDescription(
        `Tiket ini telah ditutup dan secara otomatis diarsipkan.\n\n` +
        `**Detail Arsip:**\n` +
        `• Ditutup oleh: ${interaction.user}\n` +
        `• Waktu penutupan: <t:${Math.floor(Date.now() / 1000)}:F>\n` +
        `• Status: Tersimpan di Local Storage\n` +
        `• Kategori: Arsip Otomatis`
      )
      .setColor('#FFA500')
      .setFooter({ text: 'Data tiket telah disimpan secara permanen' })
      .setTimestamp()
    
    await channel.send({ embeds: [archiveEmbed] })
    
    return { success: true }
  } catch (error) {
    console.error('Error closing and archiving ticket:', error)
    return {
      success: false,
      message: `Gagal menutup tiket: ${error.message}`,
      ephemeral: true
    }
  }
}

// Rename a ticket
async function renameTicket(interaction, newName, categories) {
  const channel = interaction.channel
  
  // Check if it's a ticket channel
  if (!isTicketChannel(channel, categories)) {
    return {
      success: false,
      message: 'Perintah ini harus dijalankan di dalam saluran tiket.',
      ephemeral: true
    }
  }
  
  // Check permissions
  const creatorId = channel.topic
  if (!canRenameTicket(interaction.member, creatorId)) {
    return {
      success: false,
      message: 'Anda tidak memiliki izin untuk mengganti nama tiket ini.',
      ephemeral: true
    }
  }
  
  // Check bot permissions
  const permCheck = canBotManageTickets(interaction.guild, channel)
  if (!permCheck.canManage) {
    return {
      success: false,
      message: `Bot tidak memiliki izin yang diperlukan: ${permCheck.error}`,
      ephemeral: true
    }
  }
  
  const sanitizedName = newName.toLowerCase().replace(/[^a-z0-9\-]/g, '-')
  
  try {
    await channel.edit({ 
      name: sanitizedName, 
      reason: `Ticket renamed by ${interaction.user.tag}` 
    })
    
    return {
      success: true,
      message: `Nama tiket telah diubah menjadi ${sanitizedName}.`,
      ephemeral: true
    }
  } catch (error) {
    console.error('Error renaming ticket:', error)
    return {
      success: false,
      message: `Gagal mengganti nama tiket: ${error.message}`,
      ephemeral: true
    }
  }
}

// Archive a ticket manually (for tickets that are already closed)
async function archiveTicket(interaction, categories) {
  const channel = interaction.channel
  
  // Check if it's a ticket channel
  if (!isTicketChannel(channel, categories)) {
    return {
      success: false,
      message: 'Perintah ini harus dijalankan di dalam saluran tiket.',
      ephemeral: true
    }
  }
  
  // Check bot permissions
  const permCheck = canBotManageTickets(interaction.guild, channel)
  if (!permCheck.canManage) {
    return {
      success: false,
      message: `Bot tidak memiliki izin yang diperlukan: ${permCheck.error}`,
      ephemeral: true
    }
  }
  
  try {
    await channel.edit({ 
      parent: categories.archive, 
      name: `archived-${channel.name.replace(/^(ticket-|closed-|archived-)/, '')}`, 
      reason: `Ticket manually archived by ${interaction.user.tag}` 
    })
    
    // Archive ticket data in local storage
    archiveTicketData(channel.id, interaction.user.id)
    
    await interaction.reply({ content: 'Tiket telah dipindahkan ke arsip dan disimpan ke local storage.', flags: 64 })
    
    const archiveEmbed = new EmbedBuilder()
      .setTitle('🗃️ Tiket Diarsipkan Manual')
      .setDescription(
        `Tiket ini telah diarsipkan secara manual.\n\n` +
        `**Detail Arsip:**\n` +
        `• Diarsipkan oleh: ${interaction.user}\n` +
        `• Waktu pengarsipan: <t:${Math.floor(Date.now() / 1000)}:F>\n` +
        `• Status: Tersimpan di Local Storage\n` +
        `• Kategori: Arsip Manual`
      )
      .setColor('#2ECC71')
      .setFooter({ text: 'Data tiket telah disimpan secara permanen' })
      .setTimestamp()
    
    await channel.send({ embeds: [archiveEmbed] })
    
    return { success: true }
  } catch (error) {
    console.error('Error archiving ticket:', error)
    return {
      success: false,
      message: `Gagal mengarsipkan tiket: ${error.message}`,
      ephemeral: true
    }
  }
}

// Delete a ticket
async function deleteTicket(interaction, categories) {
  const channel = interaction.channel
  
  // Check if it's a ticket channel
  if (!isTicketChannel(channel, categories)) {
    return {
      success: false,
      message: 'Perintah ini harus dijalankan di dalam saluran tiket.',
      ephemeral: true
    }
  }
  
  // Check bot permissions
  const permCheck = canBotManageTickets(interaction.guild, channel)
  if (!permCheck.canManage) {
    return {
      success: false,
      message: `Bot tidak memiliki izin yang diperlukan: ${permCheck.error}`,
      ephemeral: true
    }
  }
  
  try {
    await interaction.reply({ content: 'Tiket akan dihapus dalam 5 detik...', flags: 64 })
    
    // Store channel info before deletion
    const channelInfo = {
      name: channel.name,
      id: channel.id,
      creator: channel.topic
    }
    
    setTimeout(async () => {
      try {
        await channel.delete(`Ticket deleted by ${interaction.user.tag}`)
        console.log('Ticket successfully deleted:', channelInfo)
      } catch (deleteError) {
        console.error('Error deleting ticket:', deleteError)
        
        // Try to send error message to a different channel
        try {
          const guild = interaction.guild
          const logChannel = guild.channels.cache.find(ch => 
            ch.name === 'bot-logs' || ch.name === 'general'
          )
          if (logChannel) {
            await logChannel.send(
              `⚠️ Gagal menghapus tiket ${channelInfo.name}: ${deleteError.message}`
            )
          }
        } catch (logError) {
          console.error('Could not send error log:', logError.message)
        }
      }
    }, 5000)
    
    return { success: true }
  } catch (error) {
    console.error('Error preparing ticket deletion:', error)
    return {
      success: false,
      message: `Gagal mempersiapkan penghapusan tiket: ${error.message}`,
      ephemeral: true
    }
  }
}

// Get ticket categories
function getTicketCategories(guild) {
  const categories = {
    active: guild.channels.cache.find(ch => 
      ch.type === ChannelType.GuildCategory && ch.name === config.categories.active
    ),
    closed: guild.channels.cache.find(ch => 
      ch.type === ChannelType.GuildCategory && ch.name === config.categories.closed
    ),
    archive: guild.channels.cache.find(ch => 
      ch.type === ChannelType.GuildCategory && ch.name === config.categories.archive
    )
  }
  
  return categories
}

module.exports = {
  prepareCategories,
  setupTicketChannel,
  createTicket,
  closeTicket,
  renameTicket,
  archiveTicket,
  deleteTicket,
  getTicketCategories,
  createTicketWelcomeEmbed,
  createTicketActionButtons
}