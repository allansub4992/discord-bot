/**
 * Product Module
 * Handles product embed creation and product-related ticket operations
 */

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { config } = require('./config')
const { saveEmbedData, getEmbedData, updateEmbedData, getAllEmbeds } = require('./storage')
const { canBotSendMessages } = require('./permissions')
const { createTicket } = require('./ticket')
const { validateHexColor, validateURL } = require('./embed')

// Create product embed with interactive buttons
async function createProductEmbed(options, targetChannel, authorId) {
  const {
    nama, jenis, harga, deskripsi, gambar, thumbnail, warna, orderChannel
  } = options
  
  // Validate inputs
  if (nama.length > config.storage.maxTitleLength) {
    throw new Error(`Nama produk terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter).`)
  }
  
  // Check bot permissions
  const permCheck = canBotSendMessages(targetChannel)
  if (!permCheck.canSend) {
    throw new Error(permCheck.error)
  }
  
  // Validate URLs if provided
  const gambarURL = validateURL(gambar)
  const thumbnailURL = validateURL(thumbnail)
  
  // Validate and set color
  let color = config.embeds.productColor // Default color for products
  if (warna) {
    color = validateHexColor(warna)
    if (color === null) {
      throw new Error('Format warna tidak valid. Gunakan format hex 6 digit tanpa #, contoh: FF6B6B')
    }
  }
  
  // Create product embed
  const productEmbed = new EmbedBuilder()
    .setTitle(`🛒 ${nama}`)
    .setColor(color)
    .addFields(
      {
        name: '🏷️ Jenis/Kategori',
        value: jenis,
        inline: true
      },
      {
        name: '💰 Harga',
        value: harga,
        inline: true
      }
    )
  
  if (deskripsi) {
    if (deskripsi.length > config.storage.maxDescriptionLength) {
      throw new Error(`Deskripsi terlalu panjang (maksimal ${config.storage.maxDescriptionLength} karakter).`)
    }
    productEmbed.setDescription(`**Deskripsi Produk:**\n${deskripsi}`)
  }
  
  if (thumbnailURL) productEmbed.setThumbnail(thumbnailURL)
  if (gambarURL) productEmbed.setImage(gambarURL)
  
  productEmbed.setFooter({ 
    text: 'Klik tombol di bawah untuk membeli atau hubungi CS', 
    iconURL: targetChannel.guild.iconURL() 
  })
  productEmbed.setTimestamp()
  
  // Create buttons
  const buyButton = new ButtonBuilder()
    .setCustomId('product_buy')
    .setLabel('🛒 Beli Sekarang')
    .setStyle(ButtonStyle.Success)
  
  const csButton = new ButtonBuilder()
    .setCustomId('product_cs')
    .setLabel('🎧 Hubungi CS')
    .setStyle(ButtonStyle.Primary)
  
  const actionRow = new ActionRowBuilder().addComponents(buyButton, csButton)
  
  // Send the product embed with buttons
  const message = await targetChannel.send({
    embeds: [productEmbed],
    components: [actionRow]
  })
  
  // Save product embed data to local storage
  const embedConfig = {
    nama,
    jenis,
    harga,
    deskripsi,
    gambar,
    thumbnail,
    warna,
    order_channel: orderChannel?.id,
    type: 'product'
  }
  saveEmbedData(message.id, embedConfig, authorId, targetChannel.id)
  
  return {
    message,
    embed: productEmbed,
    embedConfig
  }
}

// Handle product buy button click
async function handleProductBuy(interaction) {
  try {
    // Get the embed data to check if specific order channel was set
    const messageId = interaction.message.id
    const embedData = getEmbedData(messageId)
    
    let orderChannel = null
    
    // If specific order channel was set in the product
    if (embedData && embedData.config.order_channel) {
      orderChannel = interaction.guild.channels.cache.get(embedData.config.order_channel)
    }
    
    // If no specific channel, try to find order-ticket channel
    if (!orderChannel) {
      const guild = interaction.guild
      
      // Try to find order-ticket channel
      orderChannel = guild.channels.cache.find(ch => 
        ch.name.toLowerCase().includes('order') && ch.name.toLowerCase().includes('ticket')
      )
      
      // If not found, try some common variations
      if (!orderChannel) {
        orderChannel = guild.channels.cache.find(ch => 
          ch.name.toLowerCase() === 'order-ticket' || 
          ch.name.toLowerCase() === 'orders' ||
          ch.name.toLowerCase() === 'pemesanan' ||
          ch.name.toLowerCase() === 'beli'
        )
      }
    }
    
    if (orderChannel) {
      await interaction.reply({
        content: `🛒 **Untuk membeli produk ini, silakan kunjungi channel:** ${orderChannel}\n\n📝 Di channel tersebut Anda dapat membuat tiket pemesanan untuk menyelesaikan transaksi dengan aman.`,
        ephemeral: true
      })
    } else {
      // Create ticket for order if no order channel found
      const result = await createOrderTicket(interaction)
      
      if (result.success) {
        await interaction.reply({
          content: result.message,
          flags: result.ephemeral ? 64 : 0
        })
      } else {
        await interaction.reply({
          content: result.message,
          flags: result.ephemeral ? 64 : 0
        })
      }
    }
  } catch (error) {
    console.error('Error handling product buy:', error)
    await interaction.reply({
      content: 'Terjadi kesalahan saat memproses permintaan pembelian. Silakan hubungi admin.',
      flags: 64 // ephemeral flag
    })
  }
}

// Handle product CS button click
async function handleProductCS(interaction) {
  try {
    // Create a support ticket for customer service
    const result = await createCSTicket(interaction)
    
    if (result.success) {
      await interaction.reply({
        content: result.message,
        flags: result.ephemeral ? 64 : 0
      })
    } else {
      await interaction.reply({
        content: result.message,
        flags: result.ephemeral ? 64 : 0
      })
    }
  } catch (error) {
    console.error('Error handling product CS:', error)
    await interaction.reply({
      content: 'Terjadi kesalahan saat membuat tiket CS. Silakan hubungi admin.',
      flags: 64 // ephemeral flag
    })
  }
}

// Create order ticket function
async function createOrderTicket(interaction) {
  try {
    const result = await createTicket(interaction, 'order')
    return result
  } catch (error) {
    console.error('Error creating order ticket:', error)
    return {
      success: false,
      message: `Gagal membuat tiket pemesanan: ${error.message}`,
      ephemeral: true
    }
  }
}

// Create CS ticket function
async function createCSTicket(interaction) {
  try {
    const result = await createTicket(interaction, 'cs')
    return result
  } catch (error) {
    console.error('Error creating CS ticket:', error)
    return {
      success: false,
      message: `Gagal membuat tiket CS: ${error.message}`,
      ephemeral: true
    }
  }
}

// Validate product embed options
function validateProductOptions(options) {
  const { nama, jenis, harga } = options
  const errors = []
  
  if (!nama || nama.trim().length === 0) {
    errors.push('Nama produk tidak boleh kosong')
  }
  
  if (!jenis || jenis.trim().length === 0) {
    errors.push('Jenis/kategori produk tidak boleh kosong')
  }
  
  if (!harga || harga.trim().length === 0) {
    errors.push('Harga produk tidak boleh kosong')
  }
  
  if (nama && nama.length > config.storage.maxTitleLength) {
    errors.push(`Nama produk terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter)`)
  }
  
  if (options.deskripsi && options.deskripsi.length > config.storage.maxDescriptionLength) {
    errors.push(`Deskripsi terlalu panjang (maksimal ${config.storage.maxDescriptionLength} karakter)`)
  }
  
  if (options.gambar && !validateURL(options.gambar)) {
    errors.push('URL gambar tidak valid')
  }
  
  if (options.thumbnail && !validateURL(options.thumbnail)) {
    errors.push('URL thumbnail tidak valid')
  }
  
  if (options.warna && !validateHexColor(options.warna)) {
    errors.push('Format warna tidak valid. Gunakan format hex 6 digit tanpa #')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Create product summary for confirmation
function createProductSummary(options, targetChannel, orderChannel) {
  const summary = [
    `📝 **Detail Produk:**`,
    `• Nama: ${options.nama}`,
    `• Jenis: ${options.jenis}`,
    `• Harga: ${options.harga}`,
    `• Channel: ${targetChannel}`
  ]
  
  if (options.deskripsi) {
    summary.push(`• Deskripsi: ${options.deskripsi.slice(0, 100)}${options.deskripsi.length > 100 ? '...' : ''}`)
  }
  
  if (orderChannel) {
    summary.push(`• Channel Order: ${orderChannel}`)
  }
  
  summary.push(`\n🔄 Pengguna dapat mengklik tombol **Beli Sekarang** untuk ${orderChannel ? `diarahkan ke ${orderChannel}` : 'membuat tiket pemesanan'} atau **Hubungi CS** untuk membuat tiket customer service.`)
  
  return summary.join('\n')
}

// Get product embed data
function getProductEmbedData(messageId) {
  const embedData = getEmbedData(messageId)
  if (embedData && embedData.config.type === 'product') {
    return embedData
  }
  return null
}

// Check if message is a product embed
function isProductEmbed(messageId) {
  const embedData = getProductEmbedData(messageId)
  return embedData !== null
}

// Update product embed data
function updateProductEmbedData(messageId, newConfig) {
  const embedData = getEmbedData(messageId)
  if (embedData && embedData.config.type === 'product') {
    const updatedConfig = {
      ...embedData.config,
      ...newConfig,
      type: 'product' // Ensure type remains product
    }
    return updateEmbedData(messageId, updatedConfig)
  }
  return false
}

// Edit existing product embed
async function editProductEmbed(messageId, targetChannel, newOptions, client) {
  try {
    // Get the original embed data
    const embedData = getProductEmbedData(messageId)
    if (!embedData) {
      throw new Error('Embed produk tidak ditemukan atau bukan embed produk yang dibuat oleh bot ini.')
    }

    // Fetch the message
    const message = await targetChannel.messages.fetch(messageId)
    if (!message) {
      throw new Error('Pesan tidak ditemukan di channel ini.')
    }

    if (message.author.id !== client.user.id) {
      throw new Error('Hanya dapat mengedit embed yang dibuat oleh bot ini.')
    }

    // Merge old and new options
    const currentConfig = embedData.config
    const updatedOptions = {
      nama: newOptions.nama || currentConfig.nama,
      jenis: newOptions.jenis || currentConfig.jenis,
      harga: newOptions.harga || currentConfig.harga,
      deskripsi: newOptions.deskripsi !== undefined ? newOptions.deskripsi : currentConfig.deskripsi,
      gambar: newOptions.gambar !== undefined ? newOptions.gambar : currentConfig.gambar,
      thumbnail: newOptions.thumbnail !== undefined ? newOptions.thumbnail : currentConfig.thumbnail,
      warna: newOptions.warna || currentConfig.warna,
      orderChannel: currentConfig.order_channel ? { id: currentConfig.order_channel } : null
    }

    // Validate the updated options
    const validation = validateProductOptions(updatedOptions)
    if (!validation.isValid) {
      throw new Error(`Validasi gagal: ${validation.errors.join(', ')}`)
    }

    // Validate URLs if provided
    const gambarURL = validateURL(updatedOptions.gambar)
    const thumbnailURL = validateURL(updatedOptions.thumbnail)
    
    // Validate and set color
    let color = config.embeds.productColor
    if (updatedOptions.warna) {
      color = validateHexColor(updatedOptions.warna)
      if (color === null) {
        throw new Error('Format warna tidak valid. Gunakan format hex 6 digit tanpa #, contoh: FF6B6B')
      }
    }

    // Create updated embed
    const updatedEmbed = new EmbedBuilder()
      .setTitle(`🛒 ${updatedOptions.nama}`)
      .setColor(color)
      .addFields(
        {
          name: '🏷️ Jenis/Kategori',
          value: updatedOptions.jenis,
          inline: true
        },
        {
          name: '💰 Harga',
          value: updatedOptions.harga,
          inline: true
        }
      )

    if (updatedOptions.deskripsi) {
      updatedEmbed.setDescription(`**Deskripsi Produk:**\n${updatedOptions.deskripsi}`)
    }

    if (thumbnailURL) updatedEmbed.setThumbnail(thumbnailURL)
    if (gambarURL) updatedEmbed.setImage(gambarURL)

    updatedEmbed.setFooter({ 
      text: 'Klik tombol di bawah untuk membeli atau hubungi CS', 
      iconURL: targetChannel.guild.iconURL() 
    })
    updatedEmbed.setTimestamp()

    // Keep the same buttons
    const buyButton = new ButtonBuilder()
      .setCustomId('product_buy')
      .setLabel('🛒 Beli Sekarang')
      .setStyle(ButtonStyle.Success)

    const csButton = new ButtonBuilder()
      .setCustomId('product_cs')
      .setLabel('🎧 Hubungi CS')
      .setStyle(ButtonStyle.Primary)

    const actionRow = new ActionRowBuilder().addComponents(buyButton, csButton)

    // Update the message
    await message.edit({
      embeds: [updatedEmbed],
      components: [actionRow]
    })

    // Update storage
    const updatedConfig = {
      nama: updatedOptions.nama,
      jenis: updatedOptions.jenis,
      harga: updatedOptions.harga,
      deskripsi: updatedOptions.deskripsi,
      gambar: updatedOptions.gambar,
      thumbnail: updatedOptions.thumbnail,
      warna: updatedOptions.warna,
      order_channel: updatedOptions.orderChannel?.id,
      type: 'product'
    }
    updateProductEmbedData(messageId, updatedConfig)

    return {
      success: true,
      message: `✅ Embed produk "${updatedOptions.nama}" berhasil diperbarui!`
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

// Get list of all products
function getProductList(showDetails = false) {
  const allEmbeds = getAllEmbeds()
  const products = Object.entries(allEmbeds)
    .filter(([messageId, embedData]) => embedData.config.type === 'product')
    .map(([messageId, embedData]) => ({
      messageId,
      ...embedData.config,
      created_at: embedData.created_at,
      edited_count: embedData.edited_count || 0,
      author_id: embedData.author_id,
      channel_id: embedData.channel_id
    }))

  return products
}

// Create product list embed
function createProductListEmbed(products, showDetails = false) {
  const embed = new EmbedBuilder()
    .setTitle('📦 Daftar Produk')
    .setColor(config.embeds.productColor)
    .setTimestamp()

  if (products.length === 0) {
    embed.setDescription('Belum ada produk yang dibuat.')
    return embed
  }

  if (showDetails) {
    const productDetails = products.slice(0, 10).map((product, index) => {
      const editInfo = product.edited_count > 0 ? ` (diedit ${product.edited_count}x)` : ''
      return `**${index + 1}. ${product.nama}**\n` +
             `📝 ID: \`${product.messageId}\`\n` +
             `🏷️ Jenis: ${product.jenis}\n` +
             `💰 Harga: ${product.harga}\n` +
             `📅 Dibuat: <t:${Math.floor(new Date(product.created_at).getTime() / 1000)}:R>${editInfo}\n`
    }).join('\n')

    embed.setDescription(productDetails)
    
    if (products.length > 10) {
      embed.setFooter({ text: `Menampilkan 10 dari ${products.length} produk` })
    }
  } else {
    const productList = products.map((product, index) => {
      return `**${index + 1}.** ${product.nama} - ${product.harga} (\`${product.messageId}\`)`
    }).join('\n')

    embed.setDescription(productList)
    embed.setFooter({ text: `Total: ${products.length} produk | Gunakan detail:true untuk info lengkap` })
  }

  return embed
}

// Delete product embed
async function deleteProductEmbed(messageId, targetChannel, client) {
  try {
    // Check if it's a product embed
    const embedData = getProductEmbedData(messageId)
    if (!embedData) {
      throw new Error('Embed produk tidak ditemukan atau bukan embed produk yang dibuat oleh bot ini.')
    }

    // Fetch and delete the message
    const message = await targetChannel.messages.fetch(messageId)
    if (!message) {
      throw new Error('Pesan tidak ditemukan di channel ini.')
    }

    if (message.author.id !== client.user.id) {
      throw new Error('Hanya dapat menghapus embed yang dibuat oleh bot ini.')
    }

    const productName = embedData.config.nama
    await message.delete()

    // Remove from storage (this would need to be implemented in storage.js)
    // For now, we'll just mark it as deleted in the config
    const updatedConfig = {
      ...embedData.config,
      deleted: true,
      deleted_at: new Date().toISOString()
    }
    updateProductEmbedData(messageId, updatedConfig)

    return {
      success: true,
      message: `✅ Embed produk "${productName}" berhasil dihapus!`
    }
  } catch (error) {
    return {
      success: false,
      message: error.message
    }
  }
}

module.exports = {
  // Core product functions
  createProductEmbed,
  handleProductBuy,
  handleProductCS,
  
  // Product management
  editProductEmbed,
  getProductList,
  createProductListEmbed,
  deleteProductEmbed,
  
  // Ticket creation
  createOrderTicket,
  createCSTicket,
  
  // Validation and utilities
  validateProductOptions,
  createProductSummary,
  getProductEmbedData,
  isProductEmbed,
  updateProductEmbedData
}