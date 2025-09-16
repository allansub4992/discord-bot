/**
 * Event Handlers Module
 * Handles all Discord interactions and events
 */

const fs = require('fs')
const path = require('path')
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

// Import all required modules
// Import all required modules
const { config } = require('./config')
const { 
  clearData, 
  createBackup, 
  getStorageInfo,
  getSettings,
  updateSettings 
} = require('./storage')
const { 
  canManage, 
  canEditEmbeds, 
  canManageData, 
  checkBotPermissions 
} = require('./permissions')
const { 
  setupTicketChannel, 
  createTicket, 
  closeTicket, 
  renameTicket, 
  archiveTicket, 
  deleteTicket, 
  getTicketCategories 
} = require('./ticket')
const { 
  createBasicEmbed, 
  createAdvancedEmbed, 
  createTemplateEmbed, 
  editEmbed, 
  saveTemplate, 
  loadTemplate, 
  deleteTemplate, 
  createEmbedListEmbed, 
  createEmbedStatsEmbed 
} = require('./embed')
const { 
  createProductEmbed, 
  handleProductBuy, 
  handleProductCS, 
  validateProductOptions, 
  createProductSummary,
  editProductEmbed,
  getProductList,
  createProductListEmbed,
  deleteProductEmbed
} = require('./product')
const {
  createBotStatusEmbed,
  createServerInfoEmbed,
  createStatsEmbed,
  createSystemInfoEmbed,
  createFullStatusEmbed
} = require('./status')
const {
  createMainHelpEmbed,
  createCommandHelpEmbed,
  createQuickReferenceEmbed
} = require('./help')

// Handle button interactions
async function handleButtonInteraction(interaction) {
  try {
    if (interaction.customId === 'create_ticket') {
      const result = await createTicket(interaction, 'general')
      await interaction.reply({
        content: result.message,
        flags: result.ephemeral ? 64 : 0
      })
    } else if (interaction.customId === 'product_buy') {
      await handleProductBuy(interaction)
    } else if (interaction.customId === 'product_cs') {
      await handleProductCS(interaction)
    } else if (interaction.customId === 'close_order_ticket') {
      await handleCloseOrderTicket(interaction)
    } else if (interaction.customId === 'confirm_close_order') {
      // This is handled by the collector in handleCloseOrderTicket
      return
    } else if (interaction.customId === 'cancel_close_order') {
      // This is handled by the collector in handleCloseOrderTicket
      return
    }
  } catch (error) {
    console.error('Error handling button interaction:', error)
    const errorMessage = 'Terjadi kesalahan saat memproses permintaan Anda.'
    
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: errorMessage, 
          flags: 64
        })
      } else {
        await interaction.followUp({ 
          content: errorMessage, 
          flags: 64
        })
      }
    } catch (replyError) {
      console.error('Error sending button error response:', replyError)
    }
  }
}

// Handle close order ticket button
async function handleCloseOrderTicket(interaction) {
  try {
    const channel = interaction.channel
    const guild = interaction.guild
    const categories = getTicketCategories(guild)
    
    // Check if this is an order ticket
    if (!channel.name.includes('order') && channel.topic !== interaction.user.id) {
      await interaction.reply({
        content: '❌ Tombol ini hanya dapat digunakan di tiket pemesanan Anda sendiri.',
        flags: 64
      })
      return
    }
    
    // Show confirmation message
    const confirmEmbed = new EmbedBuilder()
      .setTitle('🔒 Konfirmasi Penutupan Pesanan')
      .setDescription(
        '**Apakah Anda yakin ingin menutup tiket pesanan ini?**\n\n' +
        '⚠️ **Perhatian:**\n' +
        '• Tiket akan dipindahkan ke kategori "Closed"\n' +
        '• Anda tidak akan dapat mengirim pesan lagi\n' +
        '• Tim seller masih dapat melihat dan membalas\n' +
        '• Tiket dapat diarsipkan oleh admin jika diperlukan\n\n' +
        '**Pastikan transaksi telah selesai sebelum menutup tiket.**'
      )
      .setColor(config.embeds.warningColor)
      .setFooter({ text: 'Klik "Tutup Pesanan" untuk melanjutkan atau abaikan pesan ini untuk membatalkan' })
    
    const confirmButton = new ButtonBuilder()
      .setCustomId('confirm_close_order')
      .setLabel('🔒 Tutup Pesanan')
      .setStyle(ButtonStyle.Danger)
    
    const cancelButton = new ButtonBuilder()
      .setCustomId('cancel_close_order')
      .setLabel('❌ Batal')
      .setStyle(ButtonStyle.Secondary)
    
    const confirmRow = new ActionRowBuilder().addComponents(confirmButton, cancelButton)
    
    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmRow],
      flags: 64
    })
    
    // Wait for confirmation
    const filter = (i) => {
      return i.user.id === interaction.user.id && 
             (i.customId === 'confirm_close_order' || i.customId === 'cancel_close_order')
    }
    
    try {
      const confirmation = await interaction.followUp({ 
        content: 'Menunggu konfirmasi...', 
        flags: 64
      }).then(() => {
        return interaction.channel.awaitMessageComponent({ 
          filter, 
          time: 30000 
        })
      })
      
      if (confirmation.customId === 'confirm_close_order') {
        // Proceed with closing the ticket
        const closeResult = await closeTicket(confirmation, categories)
        
        if (closeResult.success) {
          await confirmation.update({
            content: '✅ Tiket pesanan berhasil ditutup!',
            embeds: [],
            components: []
          })
          
          // Send final message to the ticket
          const closeEmbed = new EmbedBuilder()
            .setTitle('🔒 Tiket Pesanan Ditutup')
            .setDescription(
              `**Tiket ini telah ditutup oleh ${interaction.user}**\n\n` +
              '📝 **Status:** Pesanan Selesai\n' +
              '⏰ **Ditutup pada:** <t:' + Math.floor(Date.now() / 1000) + ':F>\n\n' +
              '**Terima kasih telah berbelanja!** 🛍️\n' +
              'Jika ada pertanyaan lebih lanjut, silakan buat tiket baru.'
            )
            .setColor(config.embeds.successColor)
            .setFooter({ text: 'Tiket telah ditutup - Status: Selesai' })
          
          await channel.send({ embeds: [closeEmbed] })
        } else {
          await confirmation.update({
            content: `❌ Gagal menutup tiket: ${closeResult.message}`,
            embeds: [],
            components: []
          })
        }
      } else {
        await confirmation.update({
          content: '❌ Penutupan tiket dibatalkan.',
          embeds: [],
          components: []
        })
      }
    } catch (error) {
      if (error.code === 'INTERACTION_COLLECTOR_ERROR') {
        await interaction.editReply({
          content: '⏰ Waktu konfirmasi habis. Penutupan tiket dibatalkan.',
          embeds: [],
          components: []
        })
      } else {
        throw error
      }
    }
  } catch (error) {
    console.error('Error handling close order ticket:', error)
    const errorMessage = 'Terjadi kesalahan saat menutup tiket pesanan.'
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: errorMessage, flags: 64 })
    } else {
      await interaction.reply({ content: errorMessage, flags: 64 })
    }
  }
}

// Handle ticket command interactions
async function handleTicketCommand(interaction) {
  const sub = interaction.options.getSubcommand()
  const guild = interaction.guild
  const member = interaction.member
  const categories = getTicketCategories(guild)

  try {
    switch (sub) {
      case 'setup':
        if (!canManage(member)) {
          await interaction.reply({ 
            content: 'Only admins or owners can setup ticket channels.', 
            flags: 64
          })
          return
        }
        
        const targetChannel = interaction.options.getChannel('channel')
        await setupTicketChannel(targetChannel)
        await interaction.reply({ 
          content: `Ticket creation system has been set up in ${targetChannel}!`, 
          flags: 64
        })
        break

      case 'permissions':
        if (!canManage(member)) {
          await interaction.reply({ 
            content: 'Only admins or owners can check permissions.', 
            flags: 64
          })
          return
        }
        
        const checkChannel = interaction.options.getChannel('channel') || interaction.channel
        const permCheck = checkBotPermissions(guild, checkChannel)
        
        const embed = new EmbedBuilder()
          .setTitle('🔒 Bot Permissions Check')
          .setDescription(`Checking permissions for ${checkChannel}`)
          .addFields(
            {
              name: '🌐 Server Permissions',
              value: Object.entries(permCheck.serverPerms)
                .map(([perm, has]) => `${has ? '✅' : '❌'} ${perm}`)
                .join('\n'),
              inline: true
            },
            {
              name: `📝 Channel Permissions (${checkChannel.name})`,
              value: Object.entries(permCheck.channelPerms || {})
                .map(([perm, has]) => `${has ? '✅' : '❌'} ${perm}`)
                .join('\n'),
              inline: true
            }
          )
          .setColor(config.embeds.defaultColor)
          .setFooter({ text: '✅ = Has Permission | ❌ = Missing Permission' })
        
        await interaction.reply({ embeds: [embed], flags: 64 })
        break

      case 'botinfo':
        if (!canManage(member)) {
          await interaction.reply({ 
            content: 'Hanya admin atau owner yang dapat melihat informasi bot.', 
            flags: 64
          })
          return
        }
        
        const botMember = guild.members.me
        const botPermCheck = checkBotPermissions(guild, interaction.channel)
        const hasAdmin = botMember.permissions.has('Administrator')
        
        const botRoles = botMember.roles.cache
          .filter(role => role.id !== guild.id)
          .map(role => `${role.name} (${role.id})`)
          .join('\n') || 'Tidak ada role khusus'
        
        const botInfoEmbed = new EmbedBuilder()
          .setTitle('🤖 Informasi Detail Bot')
          .setDescription(`Informasi lengkap untuk ${botMember.user.tag}`)
          .addFields(
            {
              name: '📝 Informasi Dasar',
              value: `**Nama:** ${botMember.user.tag}\n**ID:** ${botMember.user.id}\n**Bergabung:** <t:${Math.floor(botMember.joinedTimestamp / 1000)}:F>\n**Administrator:** ${hasAdmin ? '✅ Ya' : '❌ Tidak'}`,
              inline: false
            },
            {
              name: '🛡️ Role Bot',
              value: botRoles,
              inline: false
            }
          )
          .setColor(hasAdmin ? config.embeds.successColor : config.embeds.warningColor)
          .setThumbnail(botMember.user.displayAvatarURL())
          .setFooter({ text: '✅ = Ada Izin | ❌ = Tidak Ada Izin' })
        
        await interaction.reply({ embeds: [botInfoEmbed], flags: 64 })
        break

      case 'open':
        const openResult = await createTicket(interaction, 'general')
        await interaction.reply({
          content: openResult.message,
          flags: openResult.ephemeral ? 64 : 0
        })
        break

      case 'close':
        const closeResult = await closeTicket(interaction, categories)
        if (closeResult.success) {
          // Response is handled in closeTicket function
        } else {
          await interaction.reply({
            content: closeResult.message,
            flags: closeResult.ephemeral ? 64 : 0
          })
        }
        break

      case 'rename':
        const newName = interaction.options.getString('name', true)
        const renameResult = await renameTicket(interaction, newName, categories)
        await interaction.reply({
          content: renameResult.message,
          flags: renameResult.ephemeral ? 64 : 0
        })
        break

      case 'archive':
        if (!canManage(member)) {
          await interaction.reply({ 
            content: 'Hanya admin atau owner yang dapat mengarsipkan tiket.', 
            flags: 64
          })
          return
        }
        
        const archiveResult = await archiveTicket(interaction, categories)
        if (!archiveResult.success) {
          await interaction.reply({
            content: archiveResult.message,
            flags: archiveResult.ephemeral ? 64 : 0
          })
        }
        break

      case 'delete':
        if (!canManage(member)) {
          await interaction.reply({ 
            content: 'Hanya admin atau owner yang dapat menghapus tiket.', 
            flags: 64
          })
          return
        }
        
        const deleteResult = await deleteTicket(interaction, categories)
        if (!deleteResult.success) {
          await interaction.reply({
            content: deleteResult.message,
            flags: deleteResult.ephemeral ? 64 : 0
          })
        }
        break
    }
  } catch (error) {
    console.error('Error in ticket command:', error)
    await interaction.reply({ 
      content: `Terjadi kesalahan: ${error.message}`, 
      flags: 64
    })
  }
}

// Handle role command interactions
async function handleRoleCommand(interaction) {
  const sub = interaction.options.getSubcommand()
  const member = interaction.member
  
  if (!canManage(member)) {
    await interaction.reply({ 
      content: 'Hanya admin atau owner yang dapat mengelola peran.', 
      flags: 64
    })
    return
  }

  const targetMember = interaction.options.getMember('user')
  const role = interaction.options.getRole('role')
  
  if (!targetMember || !role) {
    await interaction.reply({ 
      content: 'User or role not found.', 
      flags: 64
    })
    return
  }

  try {
    if (sub === 'assign') {
      await targetMember.roles.add(role)
      await interaction.reply({ 
        content: `Role ${role} successfully assigned to ${targetMember}.`, 
        flags: 64
      })
    } else if (sub === 'remove') {
      await targetMember.roles.remove(role)
      await interaction.reply({ 
        content: `Role ${role} successfully removed from ${targetMember}.`, 
        flags: 64
      })
    }
  } catch (error) {
    console.error('Error in role command:', error)
    await interaction.reply({ 
      content: `Terjadi kesalahan: ${error.message}`, 
      flags: 64
    })
  }
}

// Handle embed command interactions
async function handleEmbedCommand(interaction) {
  const sub = interaction.options.getSubcommand()
  const member = interaction.member
  
  if (!canEditEmbeds(member)) {
    await interaction.reply({ 
      content: 'Hanya admin atau owner yang dapat membuat embed.', 
      flags: 64
    })
    return
  }

  const targetChannel = interaction.options.getChannel('channel') || interaction.channel

  try {
    switch (sub) {
      case 'create':
        const basicOptions = {
          title: interaction.options.getString('title'),
          description: interaction.options.getString('description'),
          color: interaction.options.getString('color'),
          thumbnail: interaction.options.getString('thumbnail'),
          image: interaction.options.getString('image'),
          footer: interaction.options.getString('footer')
        }
        
        await createBasicEmbed(basicOptions, targetChannel, interaction.user.id)
        await interaction.reply({ 
          content: `Embed berhasil dikirim ke ${targetChannel}!`, 
          flags: 64
        })
        break

      case 'advanced':
        const advancedOptions = {
          title: interaction.options.getString('title'),
          description: interaction.options.getString('description'),
          color: interaction.options.getString('color'),
          fields: interaction.options.getString('fields'),
          author: interaction.options.getString('author'),
          authorIcon: interaction.options.getString('author_icon'),
          footer: interaction.options.getString('footer'),
          footerIcon: interaction.options.getString('footer_icon'),
          thumbnail: interaction.options.getString('thumbnail'),
          image: interaction.options.getString('image'),
          timestamp: interaction.options.getBoolean('timestamp')
        }
        
        await createAdvancedEmbed(advancedOptions, targetChannel, interaction.user.id)
        await interaction.reply({ 
          content: `Embed lanjutan berhasil dikirim ke ${targetChannel}!`, 
          flags: 64
        })
        break

      case 'template':
        const templateType = interaction.options.getString('type')
        const customTitle = interaction.options.getString('title')
        const customContent = interaction.options.getString('content')
        
        await createTemplateEmbed(templateType, customTitle, customContent, targetChannel, interaction.user.id)
        await interaction.reply({ 
          content: `Template embed "${templateType}" berhasil dikirim ke ${targetChannel}!`, 
          flags: 64
        })
        break

      case 'edit':
        const messageId = interaction.options.getString('message_id')
        const editOptions = {
          title: interaction.options.getString('title'),
          description: interaction.options.getString('description'),
          color: interaction.options.getString('color')
        }
        
        const editResult = await editEmbed(messageId, targetChannel, editOptions, interaction.client)
        await interaction.reply({ 
          content: editResult.message, 
          flags: 64
        })
        break

      case 'save':
        const templateName = interaction.options.getString('name')
        const templateData = {
          title: interaction.options.getString('title'),
          description: interaction.options.getString('description'),
          color: interaction.options.getString('color'),
          thumbnail: interaction.options.getString('thumbnail'),
          image: interaction.options.getString('image'),
          footer: interaction.options.getString('footer')
        }
        
        const saveResult = await saveTemplate(templateName, templateData, interaction.user.id)
        await interaction.reply({ 
          content: `${saveResult.message} Gunakan \`/embed load name:${templateName}\` untuk menggunakannya.`, 
          flags: 64
        })
        break

      case 'load':
        const loadName = interaction.options.getString('name')
        const loadResult = await loadTemplate(loadName, targetChannel, interaction.user.id)
        await interaction.reply({ 
          content: `Template "${loadResult.templateName}" berhasil dimuat dan dikirim ke ${targetChannel}!`, 
          flags: 64
        })
        break

      case 'list':
        const listEmbed = createEmbedListEmbed()
        await interaction.reply({ embeds: [listEmbed], flags: 64 })
        break

      case 'delete':
        const deleteName = interaction.options.getString('name')
        const deleteResult = await deleteTemplate(deleteName, interaction.user.id, canManage(member))
        await interaction.reply({ 
          content: deleteResult.message, 
          flags: 64
        })
        break

      case 'stats':
        const statsEmbed = createEmbedStatsEmbed()
        await interaction.reply({ embeds: [statsEmbed], flags: 64 })
        break
    }
  } catch (error) {
    console.error('Error in embed command:', error)
    await interaction.reply({ 
      content: `Terjadi kesalahan: ${error.message}`, 
      ephemeral: true 
    })
  }
}

// Handle data command interactions
async function handleDataCommand(interaction) {
  const sub = interaction.options.getSubcommand()
  const member = interaction.member
  
  if (!canManageData(member)) {
    await interaction.reply({ 
      content: 'Hanya admin atau owner yang dapat mengelola data bot.', 
      flags: 64
    })
    return
  }

  try {
    switch (sub) {
      case 'backup':
        const backupData = createBackup()
        const backupFileName = `bot-backup-${new Date().toISOString().split('T')[0]}.json`
        const backupContent = JSON.stringify(backupData, null, 2)
        
        const dataDir = path.join(__dirname, '..', 'data')
        const tempFile = path.join(dataDir, backupFileName)
        fs.writeFileSync(tempFile, backupContent)
        
        await interaction.reply({
          content: '💾 **Backup berhasil dibuat!**\n\nBackup mencakup:\n• Semua embed tersimpan\n• Data tiket\n• Template custom\n• Pengaturan bot',
          files: [{
            attachment: tempFile,
            name: backupFileName
          }],
          flags: 64
        })
        
        setTimeout(() => {
          try {
            fs.unlinkSync(tempFile)
          } catch (error) {
            console.error('Error cleaning up temp backup file:', error)
          }
        }, 5000)
        break

      case 'clear':
        const dataType = interaction.options.getString('type')
        const confirmation = interaction.options.getString('confirm')
        
        if (confirmation !== 'CONFIRM') {
          await interaction.reply({ 
            content: 'Konfirmasi tidak valid. Ketik "CONFIRM" dengan huruf kapital untuk melanjutkan penghapusan.', 
            flags: 64
          })
          return
        }
        
        const clearResult = clearData(dataType)
        if (clearResult) {
          let clearMessage = ''
          switch (dataType) {
            case 'embeds': clearMessage = 'Semua data embed telah dihapus.'; break
            case 'tickets': clearMessage = 'Semua data tiket telah dihapus.'; break
            case 'templates': clearMessage = 'Semua template custom telah dihapus.'; break
            case 'settings': clearMessage = 'Semua pengaturan telah direset ke default.'; break
            case 'all': clearMessage = '⚠️ SEMUA DATA BOT TELAH DIHAPUS! Bot akan restart dengan pengaturan default.'; break
          }
          await interaction.reply({ content: `✅ ${clearMessage}`, flags: 64 })
        } else {
          await interaction.reply({ content: 'Gagal menghapus data.', flags: 64 })
        }
        break

      case 'info':
        const storageInfo = getStorageInfo()
        const formatBytes = (bytes) => {
          if (bytes === 0) return '0 Bytes'
          const k = 1024
          const sizes = ['Bytes', 'KB', 'MB', 'GB']
          const i = Math.floor(Math.log(bytes) / Math.log(k))
          return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
        }
        
        const totalSize = Object.values(storageInfo.sizes).reduce((a, b) => a + b, 0)
        
        const infoEmbed = new EmbedBuilder()
          .setTitle('📊 Informasi Storage Bot')
          .setDescription(`Data directory: \`${storageInfo.paths.dataDir}\``)
          .setColor(config.embeds.successColor)
          .addFields(
            {
              name: '💾 File Storage',
              value: `📝 Embeds: ${formatBytes(storageInfo.sizes.embeds)}
🎫 Tickets: ${formatBytes(storageInfo.sizes.tickets)}
🎨 Templates: ${formatBytes(storageInfo.sizes.templates)}
⚙️ Settings: ${formatBytes(storageInfo.sizes.settings)}

**Total: ${formatBytes(totalSize)}**`,
              inline: true
            },
            {
              name: '📊 Data Counts',
              value: `📝 Saved Embeds: ${storageInfo.counts.saved_embeds}\n🎫 Active Tickets: ${storageInfo.counts.active_tickets}\n🖼️ Closed Tickets: ${storageInfo.counts.closed_tickets}\n🎨 Custom Templates: ${storageInfo.counts.custom_templates}`,
              inline: true
            }
          )
          .setTimestamp()
          .setFooter({ text: 'Local Storage System v1.0' })
        
        await interaction.reply({ embeds: [infoEmbed], flags: 64 })
        break

      default:
        await interaction.reply({ 
          content: 'Subcommand belum diimplementasi.', 
          flags: 64
        })
    }
  } catch (error) {
    console.error('Error in data command:', error)
    await interaction.reply({ 
      content: `Terjadi kesalahan: ${error.message}`, 
      flags: 64
    })
  }
}

// Handle product command interactions
async function handleProductCommand(interaction) {
  const sub = interaction.options.getSubcommand()
  const member = interaction.member
  
  if (!canEditEmbeds(member)) {
    await interaction.reply({ 
      content: 'Hanya admin atau owner yang dapat mengelola embed produk.', 
      flags: 64
    })
    return
  }

  try {
    switch (sub) {
      case 'buat':
        const productOptions = {
          nama: interaction.options.getString('nama'),
          jenis: interaction.options.getString('jenis'),
          harga: interaction.options.getString('harga'),
          deskripsi: interaction.options.getString('deskripsi'),
          gambar: interaction.options.getString('gambar'),
          thumbnail: interaction.options.getString('thumbnail'),
          warna: interaction.options.getString('warna'),
          orderChannel: interaction.options.getChannel('channel_order')
        }
        
        const targetChannel = interaction.options.getChannel('channel') || interaction.channel

        // Validate product options
        const validation = validateProductOptions(productOptions)
        if (!validation.isValid) {
          await interaction.reply({ 
            content: `Kesalahan validasi:\n• ${validation.errors.join('\n• ')}`, 
            flags: 64
          })
          return
        }

        const result = await createProductEmbed(productOptions, targetChannel, interaction.user.id)
        const summary = createProductSummary(productOptions, targetChannel, productOptions.orderChannel)
        
        await interaction.reply({ 
          content: `✅ **Embed produk berhasil dibuat!**\n\n${summary}`, 
          flags: 64
        })
        break

      case 'edit':
        const messageId = interaction.options.getString('message_id')
        const editOptions = {
          nama: interaction.options.getString('nama'),
          jenis: interaction.options.getString('jenis'),
          harga: interaction.options.getString('harga'),
          deskripsi: interaction.options.getString('deskripsi'),
          gambar: interaction.options.getString('gambar'),
          thumbnail: interaction.options.getString('thumbnail'),
          warna: interaction.options.getString('warna')
        }
        
        // Remove undefined values
        Object.keys(editOptions).forEach(key => {
          if (editOptions[key] === null) {
            delete editOptions[key]
          }
        })
        
        if (Object.keys(editOptions).length === 0) {
          await interaction.reply({ 
            content: 'Tidak ada perubahan yang diberikan. Berikan setidaknya satu field untuk diubah.', 
            flags: 64
          })
          return
        }
        
        const editResult = await editProductEmbed(messageId, interaction.channel, editOptions, interaction.client)
        await interaction.reply({ 
          content: editResult.message, 
          flags: 64
        })
        break

      case 'list':
        const showDetails = interaction.options.getBoolean('detail') || false
        const products = getProductList(showDetails)
        const listEmbed = createProductListEmbed(products, showDetails)
        
        await interaction.reply({ 
          embeds: [listEmbed], 
          flags: 64
        })
        break

      case 'hapus':
        const deleteMessageId = interaction.options.getString('message_id')
        const confirmation = interaction.options.getString('konfirmasi')
        
        if (confirmation !== 'HAPUS') {
          await interaction.reply({ 
            content: 'Konfirmasi tidak valid. Ketik "HAPUS" dengan huruf kapital untuk melanjutkan penghapusan.', 
            flags: 64
          })
          return
        }
        
        const deleteResult = await deleteProductEmbed(deleteMessageId, interaction.channel, interaction.client)
        await interaction.reply({ 
          content: deleteResult.message, 
          flags: 64
        })
        break

      default:
        await interaction.reply({ 
          content: 'Subcommand tidak dikenal.', 
          flags: 64
        })
    }
  } catch (error) {
    console.error('Error in product command:', error)
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: `Terjadi kesalahan: ${error.message}`, 
        flags: 64
      })
    } else {
      await interaction.followUp({ 
        content: `Terjadi kesalahan: ${error.message}`, 
        flags: 64
      })
    }
  }
}

// Handle help command interactions
async function handleHelpCommand(interaction) {
  const commandName = interaction.options.getString('command')
  const showAdmin = interaction.options.getBoolean('show_admin') || false
  const member = interaction.member

  try {
    if (commandName) {
      // Show detailed help for specific command
      const commandHelpEmbed = createCommandHelpEmbed(commandName, member)
      await interaction.reply({ 
        embeds: [commandHelpEmbed], 
        flags: 64
      })
    } else {
      // Show main help overview
      const mainHelpEmbed = createMainHelpEmbed(member, showAdmin)
      await interaction.reply({ 
        embeds: [mainHelpEmbed], 
        flags: 64
      })
    }
  } catch (error) {
    console.error('Error in help command:', error)
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: `Terjadi kesalahan: ${error.message}`, 
        flags: 64
      })
    } else {
      await interaction.followUp({ 
        content: `Terjadi kesalahan: ${error.message}`, 
        flags: 64
      })
    }
  }
}

// Handle status command interactions
async function handleStatusCommand(interaction) {
  const statusType = interaction.options.getString('type') || 'full'
  const guild = interaction.guild
  const client = interaction.client

  try {
    let statusEmbed
    
    switch (statusType) {
      case 'bot':
        statusEmbed = createBotStatusEmbed(client, guild)
        break
      case 'server':
        statusEmbed = createServerInfoEmbed(guild)
        break
      case 'stats':
        statusEmbed = createStatsEmbed(client, guild)
        break
      case 'system':
        statusEmbed = createSystemInfoEmbed(client, guild)
        break
      case 'full':
      default:
        statusEmbed = createFullStatusEmbed(client, guild)
        break
    }
    
    await interaction.reply({ 
      embeds: [statusEmbed], 
      flags: 64
    })
  } catch (error) {
    console.error('Error in status command:', error)
    
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ 
        content: `Terjadi kesalahan: ${error.message}`, 
        flags: 64
      })
    } else {
      await interaction.followUp({ 
        content: `Terjadi kesalahan: ${error.message}`, 
        flags: 64
      })
    }
  }
}

// Handle main interaction handler
async function handleInteraction(interaction) {
  try {
    // Handle button interactions
    if (interaction.isButton()) {
      await handleButtonInteraction(interaction)
      return
    }

    // Handle slash command interactions
    if (!interaction.isChatInputCommand()) return

    const { commandName } = interaction

    switch (commandName) {
      case 'ticket':
        await handleTicketCommand(interaction)
        break
      case 'role':
        await handleRoleCommand(interaction)
        break
      case 'embed':
        await handleEmbedCommand(interaction)
        break
      case 'data':
        await handleDataCommand(interaction)
        break
      case 'produk':
        await handleProductCommand(interaction)
        break
      case 'status':
        await handleStatusCommand(interaction)
        break
      case 'help':
        await handleHelpCommand(interaction)
        break
      case 'closeticket':
        const { execute } = require('./closeticket')
        await execute(interaction)
        break
      case 'viewarchive':
        const { execute: executeViewArchive } = require('./archive')
        await executeViewArchive(interaction)
        break
      default:
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({ 
            content: 'Unknown command.', 
            flags: 64
          })
        }
    }
  } catch (error) {
    console.error('Error handling interaction:', error)
    const errorMessage = 'An error occurred while processing your request.'
    
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ 
          content: errorMessage, 
          flags: 64
        })
      } else if (interaction.deferred) {
        await interaction.editReply({ content: errorMessage })
      } else {
        await interaction.followUp({ 
          content: errorMessage, 
          flags: 64
        })
      }
    } catch (replyError) {
      console.error('Error sending error response:', replyError)
      // Don't throw here to prevent further errors
    }
  }
}

module.exports = {
  handleInteraction,
  handleButtonInteraction,
  handleTicketCommand,
  handleRoleCommand,
  handleEmbedCommand,
  handleDataCommand,
  handleProductCommand,
  handleStatusCommand,
  handleHelpCommand,
  handleCloseOrderTicket
}