/**
 * Embed Management Module
 * Handles all embed creation, editing, and template operations
 */

const { EmbedBuilder } = require('discord.js')
const { config, isValidHexColor, isValidURL } = require('./config')
const { 
  saveEmbedData, 
  updateEmbedData, 
  getEmbedData, 
  saveCustomTemplate, 
  getCustomTemplate, 
  deleteCustomTemplate, 
  getAllTemplates,
  getEmbedStats 
} = require('./storage')
const { canBotSendMessages } = require('./permissions')

// Validate hex color and convert to integer
function validateHexColor(color) {
  if (!color) return null
  const hex = color.replace('#', '')
  if (!isValidHexColor(hex)) {
    throw new Error('Format warna tidak valid. Gunakan format hex 6 digit tanpa #, contoh: 00AE86')
  }
  return parseInt(hex, 16)
}

// Validate URL
function validateURL(url) {
  if (!url) return null
  if (!isValidURL(url)) {
    throw new Error('Format URL tidak valid')
  }
  return url
}

// Parse fields from string format
function parseFields(fieldsString) {
  if (!fieldsString) return []
  
  const fields = []
  const fieldPairs = fieldsString.split(';')
  
  for (const pair of fieldPairs) {
    const parts = pair.split('|')
    if (parts.length >= 2) {
      const name = parts[0].trim()
      const value = parts[1].trim()
      const inline = parts[2] ? parts[2].trim().toLowerCase() === 'true' : false
      
      if (name && value) {
        if (name.length > config.storage.maxTitleLength) {
          throw new Error(`Nama field terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter): ${name.slice(0, 50)}...`)
        }
        if (value.length > config.storage.maxFieldLength) {
          throw new Error(`Nilai field terlalu panjang (maksimal ${config.storage.maxFieldLength} karakter): ${value.slice(0, 50)}...`)
        }
        
        fields.push({ name, value, inline })
      }
    }
  }
  
  if (fields.length > config.storage.maxFields) {
    throw new Error(`Maksimal ${config.storage.maxFields} field per embed`)
  }
  
  return fields
}

// Create basic embed
async function createBasicEmbed(options, targetChannel, authorId) {
  const { title, description, color, thumbnail, image, footer } = options
  
  // Validate inputs
  if (title.length > config.storage.maxTitleLength) {
    throw new Error(`Judul terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter).`)
  }
  
  if (description.length > config.storage.maxDescriptionLength) {
    throw new Error(`Deskripsi terlalu panjang (maksimal ${config.storage.maxDescriptionLength} karakter).`)
  }
  
  // Check bot permissions
  const permCheck = canBotSendMessages(targetChannel)
  if (!permCheck.canSend) {
    throw new Error(permCheck.error)
  }
  
  const embedColor = validateHexColor(color)
  const thumbnailURL = validateURL(thumbnail)
  const imageURL = validateURL(image)
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle(title)
    .setDescription(description)
  
  if (embedColor !== null) embed.setColor(embedColor)
  else embed.setColor(config.embeds.defaultColor)
  
  if (thumbnailURL) embed.setThumbnail(thumbnailURL)
  if (imageURL) embed.setImage(imageURL)
  if (footer) embed.setFooter({ text: footer })
  
  const message = await targetChannel.send({ embeds: [embed] })
  
  // Save embed data
  const embedConfig = {
    title,
    description,
    color: color || null,
    thumbnail,
    image,
    footer,
    type: 'basic'
  }
  saveEmbedData(message.id, embedConfig, authorId, targetChannel.id)
  
  return { message, embed }
}

// Create advanced embed
async function createAdvancedEmbed(options, targetChannel, authorId) {
  const {
    title, description, color, fields, author, authorIcon,
    footer, footerIcon, thumbnail, image, timestamp
  } = options
  
  // Validate inputs
  if (title.length > config.storage.maxTitleLength) {
    throw new Error(`Judul terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter).`)
  }
  
  if (description && description.length > config.storage.maxDescriptionLength) {
    throw new Error(`Deskripsi terlalu panjang (maksimal ${config.storage.maxDescriptionLength} karakter).`)
  }
  
  // Check bot permissions
  const permCheck = canBotSendMessages(targetChannel)
  if (!permCheck.canSend) {
    throw new Error(permCheck.error)
  }
  
  const embedColor = validateHexColor(color)
  const parsedFields = parseFields(fields)
  const thumbnailURL = validateURL(thumbnail)
  const imageURL = validateURL(image)
  const authorIconURL = validateURL(authorIcon)
  const footerIconURL = validateURL(footerIcon)
  
  // Create embed
  const embed = new EmbedBuilder()
    .setTitle(title)
  
  if (description) embed.setDescription(description)
  if (embedColor !== null) embed.setColor(embedColor)
  else embed.setColor(config.embeds.defaultColor)
  
  if (parsedFields.length > 0) embed.addFields(parsedFields)
  
  if (author) {
    if (authorIconURL) {
      embed.setAuthor({ name: author, iconURL: authorIconURL })
    } else {
      embed.setAuthor({ name: author })
    }
  }
  
  if (footer) {
    if (footerIconURL) {
      embed.setFooter({ text: footer, iconURL: footerIconURL })
    } else {
      embed.setFooter({ text: footer })
    }
  }
  
  if (thumbnailURL) embed.setThumbnail(thumbnailURL)
  if (imageURL) embed.setImage(imageURL)
  if (timestamp) embed.setTimestamp()
  
  const message = await targetChannel.send({ embeds: [embed] })
  
  // Save advanced embed data
  const embedConfig = {
    title,
    description,
    color: color || null,
    fields,
    author,
    author_icon: authorIcon,
    footer,
    footer_icon: footerIcon,
    thumbnail,
    image,
    timestamp,
    type: 'advanced'
  }
  saveEmbedData(message.id, embedConfig, authorId, targetChannel.id)
  
  return { message, embed }
}

// Create embed templates
function createEmbedTemplate(type, customTitle, customContent) {
  const templates = {
    announcement: {
      title: customTitle || '📢 Pengumuman Penting',
      description: customContent || 'Ini adalah pengumuman penting untuk semua member server.',
      color: 0x3498DB,
      thumbnail: null
    },
    success: {
      title: customTitle || '✅ Berhasil',
      description: customContent || 'Operasi telah berhasil dilakukan!',
      color: config.embeds.successColor,
      thumbnail: null
    },
    warning: {
      title: customTitle || '⚠️ Peringatan',
      description: customContent || 'Harap perhatikan peringatan ini dengan seksama.',
      color: config.embeds.warningColor,
      thumbnail: null
    },
    error: {
      title: customTitle || '❌ Terjadi Kesalahan',
      description: customContent || 'Telah terjadi kesalahan. Silakan coba lagi atau hubungi administrator.',
      color: config.embeds.errorColor,
      thumbnail: null
    },
    info: {
      title: customTitle || 'ℹ️ Informasi',
      description: customContent || 'Berikut adalah informasi yang perlu Anda ketahui.',
      color: 0x9B59B6,
      thumbnail: null
    },
    event: {
      title: customTitle || '🎉 Event Spesial',
      description: customContent || 'Bergabunglah dengan event menarik kami!\n\n🗓️ **Waktu:** TBA\n📍 **Lokasi:** Discord Server\n🎁 **Hadiah:** Surprise!',
      color: 0xFF6B6B,
      thumbnail: null
    },
    rules: {
      title: customTitle || '📝 Aturan Server',
      description: customContent || '**Harap patuhi aturan berikut:**\n\n1️⃣ Bersikap sopan dan hormat\n2️⃣ Dilarang spam atau flood\n3️⃣ Gunakan channel sesuai topik\n4️⃣ Dilarang konten NSFW\n5️⃣ Ikuti instruksi moderator',
      color: 0x34495E,
      thumbnail: null
    },
    welcome: {
      title: customTitle || '👋 Selamat Datang!',
      description: customContent || 'Selamat datang di server kami! Semoga Anda merasa nyaman dan dapat berinteraksi dengan baik bersama member lainnya.\n\n🔹 Baca aturan server\n🔹 Perkenalkan diri Anda\n🔹 Nikmati waktu Anda di sini!',
      color: 0x1ABC9C,
      thumbnail: null
    }
  }
  
  return templates[type] || templates.info
}

// Create template embed
async function createTemplateEmbed(templateType, customTitle, customContent, targetChannel, authorId) {
  // Check bot permissions
  const permCheck = canBotSendMessages(targetChannel)
  if (!permCheck.canSend) {
    throw new Error(permCheck.error)
  }
  
  const template = createEmbedTemplate(templateType, customTitle, customContent)
  
  const embed = new EmbedBuilder()
    .setTitle(template.title)
    .setDescription(template.description)
    .setColor(template.color)
  
  if (template.thumbnail) embed.setThumbnail(template.thumbnail)
  
  const message = await targetChannel.send({ embeds: [embed] })
  
  // Save template embed data
  const embedConfig = {
    template_type: templateType,
    custom_title: customTitle,
    custom_content: customContent,
    type: 'template'
  }
  saveEmbedData(message.id, embedConfig, authorId, targetChannel.id)
  
  return { message, embed }
}

// Edit existing embed
async function editEmbed(messageId, targetChannel, options, client) {
  const { title: newTitle, description: newDescription, color: newColorHex } = options
  
  try {
    const message = await targetChannel.messages.fetch(messageId)
    
    if (!message.author.bot || message.author.id !== client.user.id) {
      throw new Error('Hanya bisa mengedit embed yang dibuat oleh bot ini.')
    }
    
    if (!message.embeds || message.embeds.length === 0) {
      throw new Error('Pesan tersebut tidak mengandung embed.')
    }
    
    const originalEmbed = message.embeds[0]
    const editedEmbed = new EmbedBuilder(originalEmbed.data)
    
    if (newTitle) {
      if (newTitle.length > config.storage.maxTitleLength) {
        throw new Error(`Judul terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter).`)
      }
      editedEmbed.setTitle(newTitle)
    }
    
    if (newDescription) {
      if (newDescription.length > config.storage.maxDescriptionLength) {
        throw new Error(`Deskripsi terlalu panjang (maksimal ${config.storage.maxDescriptionLength} karakter).`)
      }
      editedEmbed.setDescription(newDescription)
    }
    
    if (newColorHex) {
      const newColor = validateHexColor(newColorHex)
      if (newColor !== null) editedEmbed.setColor(newColor)
    }
    
    await message.edit({ embeds: [editedEmbed] })
    
    // Update embed data in storage
    const embedData = getEmbedData(messageId)
    if (embedData) {
      const newConfig = {
        ...embedData.config,
        title: newTitle || embedData.config.title,
        description: newDescription || embedData.config.description,
        color: newColorHex || embedData.config.color
      }
      updateEmbedData(messageId, newConfig)
    }
    
    return { success: true, message: 'Embed berhasil diedit!' }
  } catch (error) {
    if (error.code === 10008) {
      throw new Error('Pesan dengan ID tersebut tidak ditemukan.')
    } else {
      throw error
    }
  }
}

// Save custom template
async function saveTemplate(name, templateData, authorId) {
  // Check if template name already exists
  if (getCustomTemplate(name)) {
    throw new Error(`Template dengan nama "${name}" sudah ada. Gunakan nama lain atau hapus yang lama terlebih dahulu.`)
  }
  
  const { title, description, color, thumbnail, image, footer } = templateData
  
  // Validate inputs
  if (title.length > config.storage.maxTitleLength) {
    throw new Error(`Judul terlalu panjang (maksimal ${config.storage.maxTitleLength} karakter).`)
  }
  
  if (description.length > config.storage.maxDescriptionLength) {
    throw new Error(`Deskripsi terlalu panjang (maksimal ${config.storage.maxDescriptionLength} karakter).`)
  }
  
  const embedColor = validateHexColor(color)
  const thumbnailURL = validateURL(thumbnail)
  const imageURL = validateURL(image)
  
  // Save custom template
  const template = {
    title,
    description,
    color,
    thumbnail,
    image,
    footer
  }
  
  saveCustomTemplate(name, template, authorId)
  
  return { success: true, message: `Template "${name}" berhasil disimpan!` }
}

// Load custom template
async function loadTemplate(name, targetChannel, authorId) {
  const template = getCustomTemplate(name)
  if (!template) {
    throw new Error(`Template "${name}" tidak ditemukan.`)
  }
  
  // Check bot permissions
  const permCheck = canBotSendMessages(targetChannel)
  if (!permCheck.canSend) {
    throw new Error(permCheck.error)
  }
  
  // Create embed from saved template
  const embed = new EmbedBuilder()
    .setTitle(template.title)
    .setDescription(template.description)
  
  if (template.color) {
    const color = validateHexColor(template.color)
    if (color !== null) embed.setColor(color)
  } else {
    embed.setColor(config.embeds.defaultColor)
  }
  
  if (template.thumbnail) {
    const thumbnailURL = validateURL(template.thumbnail)
    if (thumbnailURL) embed.setThumbnail(thumbnailURL)
  }
  
  if (template.image) {
    const imageURL = validateURL(template.image)
    if (imageURL) embed.setImage(imageURL)
  }
  
  if (template.footer) embed.setFooter({ text: template.footer })
  
  const message = await targetChannel.send({ embeds: [embed] })
  
  // Save embed data
  const embedConfig = {
    ...template,
    type: 'custom_template',
    template_name: name
  }
  saveEmbedData(message.id, embedConfig, authorId, targetChannel.id)
  
  return { message, embed, templateName: name }
}

// Delete custom template
async function deleteTemplate(name, userId, isAdmin = false) {
  const template = getCustomTemplate(name)
  if (!template) {
    throw new Error(`Template "${name}" tidak ditemukan.`)
  }
  
  // Check if user is the creator or admin
  if (template.author_id !== userId && !isAdmin) {
    throw new Error('Anda hanya bisa menghapus template yang Anda buat sendiri.')
  }
  
  // Delete template
  deleteCustomTemplate(name)
  
  return { success: true, message: `Template "${name}" berhasil dihapus.` }
}

// Get embed statistics
function getEmbedStatistics() {
  const stats = getEmbedStats()
  const templates = getAllTemplates()
  const totalTemplates = Object.keys(templates).length
  
  return {
    totalCreated: stats.total_created,
    totalEdited: stats.total_edited,
    lastCreated: stats.last_created,
    totalTemplates,
    templates
  }
}

// Create embed list
function createEmbedListEmbed() {
  const templates = getAllTemplates()
  const customTemplates = Object.keys(templates)
  const stats = getEmbedStats()
  
  const embed = new EmbedBuilder()
    .setTitle('📋 Daftar Template dan Embed Tersimpan')
    .setColor(0x3498DB)
    .setTimestamp()
  
  if (customTemplates.length > 0) {
    const templateList = customTemplates.map(name => {
      const template = templates[name]
      return `• **${name}** - dibuat oleh <@${template.author_id}>`
    }).join('\n')
    
    embed.addFields({
      name: '🎨 Custom Templates',
      value: templateList.slice(0, 1024), // Limit to Discord field limit
      inline: false
    })
  } else {
    embed.addFields({
      name: '🎨 Custom Templates',
      value: 'Belum ada template custom yang disimpan',
      inline: false
    })
  }
  
  embed.addFields(
    {
      name: '📊 Statistik Embed',
      value: `📝 Total Dibuat: ${stats.total_created}\n🔧 Total Diedit: ${stats.total_edited}\n💾 Tersimpan: ${Object.keys(templates).length}`,
      inline: true
    },
    {
      name: '🛠️ Built-in Templates',
      value: 'announcement, success, warning, error, info, event, rules, welcome',
      inline: true
    }
  )
  
  return embed
}

// Create embed statistics embed
function createEmbedStatsEmbed() {
  const statistics = getEmbedStatistics()
  
  const embed = new EmbedBuilder()
    .setTitle('📊 Statistik Embed Bot')
    .setDescription('Statistik penggunaan sistem embed custom')
    .setColor(0x9B59B6)
    .addFields(
      {
        name: '📝 Embed Dibuat',
        value: `Total: **${statistics.totalCreated}**\nTerakhir: ${statistics.lastCreated ? `<t:${Math.floor(new Date(statistics.lastCreated).getTime() / 1000)}:R>` : 'Belum ada'}`,
        inline: true
      },
      {
        name: '🔧 Embed Diedit',
        value: `Total: **${statistics.totalEdited}**`,
        inline: true
      },
      {
        name: '💾 Template Tersimpan',
        value: `Total: **${statistics.totalTemplates}**`,
        inline: true
      }
    )
    .setTimestamp()
    .setFooter({ text: 'Powered by Local Storage System' })
  
  return embed
}

module.exports = {
  // Core embed functions
  createBasicEmbed,
  createAdvancedEmbed,
  createTemplateEmbed,
  editEmbed,
  
  // Template functions
  saveTemplate,
  loadTemplate,
  deleteTemplate,
  createEmbedTemplate,
  
  // Utility functions
  validateHexColor,
  validateURL,
  parseFields,
  getEmbedStatistics,
  createEmbedListEmbed,
  createEmbedStatsEmbed
}