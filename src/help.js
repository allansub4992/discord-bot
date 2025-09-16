/**
 * Help Module
 * Provides comprehensive help and command documentation
 */

const { EmbedBuilder } = require('discord.js')
const { config } = require('./config')
const { canManage, canEditEmbeds, canManageData } = require('./permissions')

// Command categories and descriptions
const commandCategories = {
  general: {
    title: '🎯 General Commands',
    description: 'Commands yang dapat digunakan oleh semua user',
    color: config.embeds.defaultColor,
    commands: {
      help: {
        description: 'Tampilkan bantuan dan daftar command',
        usage: '/help [command] [show_admin]',
        examples: [
          '/help',
          '/help command:ticket',
          '/help show_admin:true'
        ]
      },
      status: {
        description: 'Lihat status server dan bot',
        usage: '/status [type]',
        examples: [
          '/status',
          '/status type:bot',
          '/status type:server'
        ]
      }
    }
  },
  ticket: {
    title: '🎫 Ticket Management',
    description: 'Commands untuk mengelola sistem tiket support',
    color: 0x3498DB,
    commands: {
      'ticket open': {
        description: 'Buka tiket support baru',
        usage: '/ticket open',
        examples: ['/ticket open']
      },
      'ticket close': {
        description: 'Tutup tiket saat ini',
        usage: '/ticket close',
        examples: ['/ticket close']
      },
      'ticket rename': {
        description: 'Ganti nama tiket saat ini',
        usage: '/ticket rename name:<nama_baru>',
        examples: ['/ticket rename name:masalah-login']
      },
      closeticket: {
        description: 'Tutup tiket dengan cepat',
        usage: '/closeticket',
        examples: ['/closeticket']
      }
    }
  },
  embed: {
    title: '📝 Embed System',
    description: 'Commands untuk membuat dan mengelola embed custom',
    color: 0x9B59B6,
    adminOnly: true,
    commands: {
      'embed create': {
        description: 'Buat embed basic',
        usage: '/embed create title:<judul> description:<deskripsi> [color] [thumbnail] [image] [footer] [channel]',
        examples: [
          '/embed create title:"Pengumuman" description:"Ini adalah pengumuman penting"',
          '/embed create title:"Info" description:"Informasi server" color:00AE86'
        ]
      },
      'embed advanced': {
        description: 'Buat embed dengan fitur lanjutan',
        usage: '/embed advanced title:<judul> [description] [color] [fields] [author] [footer] [thumbnail] [image] [timestamp] [channel]',
        examples: [
          '/embed advanced title:"Event" description:"Event spesial" fields:"Waktu|20:00 WIB|true;Lokasi|Voice Channel|true" timestamp:true'
        ]
      },
      'embed template': {
        description: 'Gunakan template embed built-in',
        usage: '/embed template type:<template> [title] [content] [channel]',
        examples: [
          '/embed template type:announcement title:"Server Update" content:"Server akan maintenance"',
          '/embed template type:warning'
        ]
      },
      'embed edit': {
        description: 'Edit embed yang sudah ada',
        usage: '/embed edit message_id:<id> [title] [description] [color]',
        examples: [
          '/embed edit message_id:123456789 title:"Judul Baru"'
        ]
      },
      'embed save': {
        description: 'Simpan template embed custom',
        usage: '/embed save name:<nama> title:<judul> description:<deskripsi> [color] [thumbnail] [image] [footer]',
        examples: [
          '/embed save name:"welcome" title:"Selamat Datang" description:"Welcome to our server!"'
        ]
      },
      'embed load': {
        description: 'Gunakan template yang sudah disimpan',
        usage: '/embed load name:<nama> [channel]',
        examples: [
          '/embed load name:"welcome"'
        ]
      }
    }
  },
  product: {
    title: '🛍️ Product Management',
    description: 'Commands untuk mengelola embed produk dan penjualan',
    color: config.embeds.productColor,
    adminOnly: true,
    commands: {
      'produk buat': {
        description: 'Buat embed produk dengan tombol beli',
        usage: '/produk buat nama:<nama> jenis:<jenis> harga:<harga> [deskripsi] [gambar] [thumbnail] [warna] [channel_order] [channel]',
        examples: [
          '/produk buat nama:"VPS Premium" jenis:"Server" harga:"Rp 100.000/bulan" deskripsi:"VPS dengan spek tinggi"',
          '/produk buat nama:"Discord Bot" jenis:"Software" harga:"$25" gambar:"https://example.com/bot.png"'
        ]
      },
      'produk edit': {
        description: 'Edit embed produk yang sudah ada',
        usage: '/produk edit message_id:<id> [nama] [jenis] [harga] [deskripsi] [gambar] [thumbnail] [warna]',
        examples: [
          '/produk edit message_id:123456789 harga:"Rp 150.000/bulan"'
        ]
      },
      'produk list': {
        description: 'Lihat daftar semua produk',
        usage: '/produk list [detail]',
        examples: [
          '/produk list',
          '/produk list detail:true'
        ]
      },
      'produk hapus': {
        description: 'Hapus embed produk',
        usage: '/produk hapus message_id:<id> konfirmasi:HAPUS',
        examples: [
          '/produk hapus message_id:123456789 konfirmasi:HAPUS'
        ]
      }
    }
  },
  admin: {
    title: '🛡️ Admin Commands',
    description: 'Commands khusus untuk administrator',
    color: config.embeds.warningColor,
    adminOnly: true,
    commands: {
      'ticket setup': {
        description: 'Setup channel untuk membuat tiket',
        usage: '/ticket setup channel:<channel>',
        examples: ['/ticket setup channel:#create-ticket']
      },
      'ticket archive': {
        description: 'Arsipkan tiket ke kategori archive',
        usage: '/ticket archive',
        examples: ['/ticket archive']
      },
      'ticket delete': {
        description: 'Hapus tiket secara permanen',
        usage: '/ticket delete',
        examples: ['/ticket delete']
      },
      'role assign': {
        description: 'Berikan role kepada member',
        usage: '/role assign user:<user> role:<role>',
        examples: ['/role assign user:@user123 role:@Member']
      },
      'role remove': {
        description: 'Hapus role dari member',
        usage: '/role remove user:<user> role:<role>',
        examples: ['/role remove user:@user123 role:@Member']
      },
      'data backup': {
        description: 'Buat backup semua data bot',
        usage: '/data backup',
        examples: ['/data backup']
      },
      'data clear': {
        description: 'Hapus data tertentu (HATI-HATI!)',
        usage: '/data clear type:<type> confirm:CONFIRM',
        examples: ['/data clear type:embeds confirm:CONFIRM']
      }
    }
  }
}

// Create main help embed
function createMainHelpEmbed(member, showAdmin = false) {
  const isAdmin = canManage(member)
  const canEdit = canEditEmbeds(member)
  const canManageBot = canManageData(member)
  
  const embed = new EmbedBuilder()
    .setTitle('🆘 Bot Help - Command Center')
    .setDescription(
      '**Selamat datang di sistem bantuan Discord Bot!**\n\n' +
      '🔸 Gunakan `/help command:<nama>` untuk detail command\n' +
      '🔸 Bot ini memiliki sistem tiket, embed custom, dan product management\n' +
      `🔸 Status Anda: ${isAdmin ? '🛡️ **Admin**' : canEdit ? '📝 **Editor**' : '👤 **User**'}\n\n` +
      '**📋 Kategori Command:**'
    )
    .setColor(config.embeds.defaultColor)
    .setThumbnail('https://cdn.discordapp.com/attachments/123456789/help-icon.png') // Optional: Add bot avatar or help icon
  
  // Add general commands (always visible)
  const generalCommands = Object.entries(commandCategories.general.commands)
    .map(([cmd, info]) => `\`/${cmd}\` - ${info.description}`)
    .join('\n')
  
  embed.addFields({
    name: commandCategories.general.title,
    value: generalCommands,
    inline: false
  })
  
  // Add ticket commands (always visible)
  const ticketCommands = Object.entries(commandCategories.ticket.commands)
    .map(([cmd, info]) => `\`/${cmd}\` - ${info.description}`)
    .join('\n')
  
  embed.addFields({
    name: commandCategories.ticket.title,
    value: ticketCommands,
    inline: false
  })
  
  // Add embed commands (admin/editor only)
  if (canEdit || showAdmin) {
    const embedCommands = Object.entries(commandCategories.embed.commands)
      .slice(0, 6) // Limit to fit in embed
      .map(([cmd, info]) => `\`/${cmd}\` - ${info.description}`)
      .join('\n')
    
    embed.addFields({
      name: commandCategories.embed.title + (canEdit ? '' : ' 🔒'),
      value: embedCommands + (Object.keys(commandCategories.embed.commands).length > 6 ? '\n*...dan lainnya*' : ''),
      inline: false
    })
  }
  
  // Add product commands (admin/editor only)
  if (canEdit || showAdmin) {
    const productCommands = Object.entries(commandCategories.product.commands)
      .map(([cmd, info]) => `\`/${cmd}\` - ${info.description}`)
      .join('\n')
    
    embed.addFields({
      name: commandCategories.product.title + (canEdit ? '' : ' 🔒'),
      value: productCommands,
      inline: false
    })
  }
  
  // Add admin commands (admin only)
  if (isAdmin || showAdmin) {
    const adminCommands = Object.entries(commandCategories.admin.commands)
      .slice(0, 5) // Limit to fit
      .map(([cmd, info]) => `\`/${cmd}\` - ${info.description}`)
      .join('\n')
    
    embed.addFields({
      name: commandCategories.admin.title + (isAdmin ? '' : ' 🔒'),
      value: adminCommands + (Object.keys(commandCategories.admin.commands).length > 5 ? '\n*...dan lainnya*' : ''),
      inline: false
    })
  }
  
  embed.addFields({
    name: '💡 Tips',
    value: 
      '• Gunakan tab completion untuk autocomplete command\n' +
      '• Parameter dalam `<>` wajib diisi, `[]` opsional\n' +
      '• Beberapa command memerlukan permission khusus\n' +
      '• Gunakan `/help command:<nama>` untuk detail lengkap',
    inline: false
  })
  
  embed.setFooter({ 
    text: `Total Commands: ${getTotalCommandCount()} | Version: 2.0 | Made with ❤️`,
    iconURL: 'https://cdn.discordapp.com/attachments/123456789/bot-icon.png' // Optional
  })
  .setTimestamp()
  
  return embed
}

// Create detailed command help embed
function createCommandHelpEmbed(commandName, member) {
  const isAdmin = canManage(member)
  const canEdit = canEditEmbeds(member)
  
  // Find command in categories
  let commandInfo = null
  let categoryInfo = null
  
  for (const [catKey, category] of Object.entries(commandCategories)) {
    if (category.commands[commandName]) {
      commandInfo = category.commands[commandName]
      categoryInfo = category
      break
    }
  }
  
  if (!commandInfo) {
    return createCommandNotFoundEmbed(commandName)
  }
  
  // Check permissions for admin-only commands
  if (categoryInfo.adminOnly && !canEdit) {
    return createPermissionDeniedEmbed(commandName)
  }
  
  const embed = new EmbedBuilder()
    .setTitle(`📖 Command Help: \`/${commandName}\``)
    .setDescription(commandInfo.description)
    .setColor(categoryInfo.color)
  
  embed.addFields(
    {
      name: '💻 Usage',
      value: `\`${commandInfo.usage}\``,
      inline: false
    },
    {
      name: '📝 Examples',
      value: commandInfo.examples.map(ex => `\`${ex}\``).join('\n'),
      inline: false
    },
    {
      name: '📂 Category',
      value: categoryInfo.title,
      inline: true
    },
    {
      name: '🔐 Permission',
      value: categoryInfo.adminOnly ? 
        (canEdit ? '✅ Admin/Editor' : '❌ Admin/Editor Required') : 
        '✅ Everyone',
      inline: true
    }
  )
  
  // Add specific notes for certain commands
  const commandNotes = getCommandNotes(commandName)
  if (commandNotes) {
    embed.addFields({
      name: '⚠️ Important Notes',
      value: commandNotes,
      inline: false
    })
  }
  
  embed.setFooter({ 
    text: 'Use /help for all commands | Parameters: <required> [optional]' 
  })
  .setTimestamp()
  
  return embed
}

// Get command-specific notes
function getCommandNotes(commandName) {
  const notes = {
    'ticket close': '• Hanya dapat digunakan di dalam tiket\n• Tiket akan dipindah ke kategori "Closed"',
    'ticket delete': '• Hanya admin yang dapat menghapus tiket\n• Penghapusan bersifat permanen',
    'embed edit': '• Hanya dapat mengedit embed yang dibuat oleh bot ini\n• Memerlukan Message ID dari embed',
    'produk buat': '• Akan otomatis menambahkan tombol "Beli" dan "CS"\n• Channel order opsional untuk redirect tiket',
    'data clear': '• SANGAT BERBAHAYA! Data yang dihapus tidak dapat dikembalikan\n• Wajib konfirmasi dengan mengetik "CONFIRM"',
    'data backup': '• Backup mencakup semua embed, tiket, dan template\n• File akan dikirim sebagai attachment'
  }
  
  return notes[commandName] || null
}

// Create command not found embed
function createCommandNotFoundEmbed(commandName) {
  const embed = new EmbedBuilder()
    .setTitle('❌ Command Not Found')
    .setDescription(`Command \`/${commandName}\` tidak ditemukan.`)
    .setColor(config.embeds.errorColor)
    .addFields({
      name: '💡 Suggestions',
      value: 
        '• Gunakan `/help` untuk melihat semua command\n' +
        '• Periksa spelling command yang Anda ketik\n' +
        '• Gunakan autocomplete Discord untuk bantuan',
      inline: false
    })
    .setFooter({ text: 'Use /help for command list' })
  
  return embed
}

// Create permission denied embed
function createPermissionDeniedEmbed(commandName) {
  const embed = new EmbedBuilder()
    .setTitle('🔒 Permission Denied')
    .setDescription(`Command \`/${commandName}\` memerlukan permission Admin atau Editor.`)
    .setColor(config.embeds.warningColor)
    .addFields({
      name: '🛡️ Required Permissions',
      value: 
        '• Role Admin\n' +
        '• Role Owner\n' +
        '• Permission Administrator',
      inline: false
    })
    .setFooter({ text: 'Contact admin if you need access' })
  
  return embed
}

// Get total command count
function getTotalCommandCount() {
  let total = 0
  for (const category of Object.values(commandCategories)) {
    total += Object.keys(category.commands).length
  }
  return total
}

// Get available templates info
function getAvailableTemplates() {
  return [
    '📢 announcement', '✅ success', '⚠️ warning', '❌ error',
    'ℹ️ info', '🎉 event', '📝 rules', '👋 welcome'
  ]
}

// Create quick reference embed
function createQuickReferenceEmbed() {
  const embed = new EmbedBuilder()
    .setTitle('⚡ Quick Reference')
    .setDescription('Command paling sering digunakan')
    .setColor(0x1ABC9C)
    .addFields(
      {
        name: '🎫 Tiket Cepat',
        value: '`/ticket open` - Buka tiket\n`/closeticket` - Tutup tiket',
        inline: true
      },
      {
        name: '📝 Embed Cepat',
        value: '`/embed template type:announcement` - Buat pengumuman\n`/embed create` - Embed basic',
        inline: true
      },
      {
        name: '🛍️ Produk Cepat',
        value: '`/produk buat` - Buat produk\n`/produk list` - Lihat semua produk',
        inline: true
      }
    )
    .setFooter({ text: 'Quick commands for daily use' })
  
  return embed
}

module.exports = {
  createMainHelpEmbed,
  createCommandHelpEmbed,
  createQuickReferenceEmbed,
  commandCategories,
  getTotalCommandCount,
  getAvailableTemplates
}