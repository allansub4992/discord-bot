/**
 * Commands Module
 * Defines all slash commands for the Discord bot
 */

const { SlashCommandBuilder, ChannelType } = require('discord.js')
const { closeTicketCommand } = require('./closeticket')
const { viewArchiveCommand } = require('./archive')

// Ticket command with all subcommands
const ticketCommand = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Manage support tickets')
  .addSubcommand(sub =>
    sub
      .setName('open')
      .setDescription('Open a new ticket')
  )
  .addSubcommand(sub =>
    sub
      .setName('close')
      .setDescription('Close the current ticket')
  )
  .addSubcommand(sub =>
    sub
      .setName('rename')
      .setDescription('Rename the current ticket')
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('New name for the ticket')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('archive')
      .setDescription('Archive the current ticket (admin/owner only)')
  )
  .addSubcommand(sub =>
    sub
      .setName('delete')
      .setDescription('Delete the current ticket (admin/owner only)')
  )
  .addSubcommand(sub =>
    sub
      .setName('setup')
      .setDescription('Setup ticket creation channel (admin/owner only)')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel where users can create tickets')
          .setRequired(true)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('permissions')
      .setDescription('Check bot permissions (admin/owner only)')
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel to check permissions for')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('botinfo')
      .setDescription('Show detailed bot information and permissions (admin/owner only)')
  )

// Role management command
const roleCommand = new SlashCommandBuilder()
  .setName('role')
  .setDescription('Manage member roles')
  .addSubcommand(sub =>
    sub
      .setName('assign')
      .setDescription('Assign a role to a member (admin/owner only)')
      .addUserOption(opt =>
        opt
          .setName('user')
          .setDescription('The member to assign the role to')
          .setRequired(true)
      )
      .addRoleOption(opt =>
        opt
          .setName('role')
          .setDescription('Role to assign')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('remove')
      .setDescription('Remove a role from a member (admin/owner only)')
      .addUserOption(opt =>
        opt
          .setName('user')
          .setDescription('The member to remove the role from')
          .setRequired(true)
      )
      .addRoleOption(opt =>
        opt
          .setName('role')
          .setDescription('Role to remove')
          .setRequired(true)
      )
  )

// Embed management command
const embedCommand = new SlashCommandBuilder()
  .setName('embed')
  .setDescription('Buat dan kelola embed custom')
  .addSubcommand(sub =>
    sub
      .setName('create')
      .setDescription('Buat embed custom baru')
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Judul embed')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('description')
          .setDescription('Deskripsi embed')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('color')
          .setDescription('Warna embed (hex code tanpa #, contoh: 00AE86)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('thumbnail')
          .setDescription('URL gambar thumbnail')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('image')
          .setDescription('URL gambar utama')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('footer')
          .setDescription('Teks footer')
          .setRequired(false)
      )
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel untuk mengirim embed (default: channel ini)')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('advanced')
      .setDescription('Buat embed dengan field dan opsi lanjutan')
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Judul embed')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('description')
          .setDescription('Deskripsi embed')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('color')
          .setDescription('Warna embed (hex code tanpa #, contoh: 00AE86)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('fields')
          .setDescription('Field dalam format: Nama1|Nilai1|true;Nama2|Nilai2|false (inline: true/false)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('author')
          .setDescription('Nama author untuk embed')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('author_icon')
          .setDescription('URL icon author')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('footer')
          .setDescription('Teks footer')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('footer_icon')
          .setDescription('URL icon footer')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('thumbnail')
          .setDescription('URL gambar thumbnail')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('image')
          .setDescription('URL gambar utama')
          .setRequired(false)
      )
      .addBooleanOption(option =>
        option
          .setName('timestamp')
          .setDescription('Tambahkan timestamp saat ini')
          .setRequired(false)
      )
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel untuk mengirim embed (default: channel ini)')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('template')
      .setDescription('Gunakan template embed yang sudah tersedia')
      .addStringOption(option =>
        option
          .setName('type')
          .setDescription('Pilih template embed')
          .setRequired(true)
          .addChoices(
            { name: '📢 Pengumuman', value: 'announcement' },
            { name: '✅ Sukses', value: 'success' },
            { name: '⚠️ Peringatan', value: 'warning' },
            { name: '❌ Error', value: 'error' },
            { name: 'ℹ️ Informasi', value: 'info' },
            { name: '🎉 Event', value: 'event' },
            { name: '📝 Aturan', value: 'rules' },
            { name: '👋 Selamat Datang', value: 'welcome' }
          )
      )
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Judul custom untuk template')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('content')
          .setDescription('Konten custom untuk template')
          .setRequired(false)
      )
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel untuk mengirim embed (default: channel ini)')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('edit')
      .setDescription('Edit embed yang sudah ada (hanya untuk embed bot ini)')
      .addStringOption(option =>
        option
          .setName('message_id')
          .setDescription('ID pesan embed yang ingin diedit')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Judul baru (kosongkan jika tidak ingin mengubah)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('description')
          .setDescription('Deskripsi baru (kosongkan jika tidak ingin mengubah)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('color')
          .setDescription('Warna baru (hex code tanpa #)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('save')
      .setDescription('Simpan template embed custom untuk digunakan nanti')
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Nama template (unik)')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('title')
          .setDescription('Judul embed')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('description')
          .setDescription('Deskripsi embed')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('color')
          .setDescription('Warna embed (hex code tanpa #, contoh: 00AE86)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('thumbnail')
          .setDescription('URL gambar thumbnail')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('image')
          .setDescription('URL gambar utama')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('footer')
          .setDescription('Teks footer')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('load')
      .setDescription('Gunakan template embed yang sudah disimpan')
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Nama template yang ingin dimuat')
          .setRequired(true)
      )
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel untuk mengirim embed (default: channel ini)')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('list')
      .setDescription('Lihat daftar template dan embed yang tersimpan')
  )
  .addSubcommand(sub =>
    sub
      .setName('delete')
      .setDescription('Hapus template embed yang tersimpan')
      .addStringOption(option =>
        option
          .setName('name')
          .setDescription('Nama template yang ingin dihapus')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('stats')
      .setDescription('Lihat statistik penggunaan embed bot')
  )

// Data management command
const dataCommand = new SlashCommandBuilder()
  .setName('data')
  .setDescription('Kelola data dan storage bot (admin/owner only)')
  .addSubcommand(sub =>
    sub
      .setName('backup')
      .setDescription('Buat backup semua data bot')
  )
  .addSubcommand(sub =>
    sub
      .setName('restore')
      .setDescription('Pulihkan data dari backup')
      .addAttachmentOption(option =>
        option
          .setName('file')
          .setDescription('File backup (.json)')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('clear')
      .setDescription('Hapus semua data tersimpan (HATI-HATI!)')
      .addStringOption(option =>
        option
          .setName('type')
          .setDescription('Jenis data yang akan dihapus')
          .setRequired(true)
          .addChoices(
            { name: 'Embeds', value: 'embeds' },
            { name: 'Tickets', value: 'tickets' },
            { name: 'Templates', value: 'templates' },
            { name: 'Settings', value: 'settings' },
            { name: 'Semua Data (BERBAHAYA!)', value: 'all' }
          )
      )
      .addStringOption(option =>
        option
          .setName('confirm')
          .setDescription('Ketik "CONFIRM" untuk konfirmasi penghapusan')
          .setRequired(true)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('export')
      .setDescription('Export data dalam format yang dapat dibaca')
      .addStringOption(option =>
        option
          .setName('type')
          .setDescription('Jenis data yang akan diexport')
          .setRequired(true)
          .addChoices(
            { name: 'Embeds', value: 'embeds' },
            { name: 'Tickets', value: 'tickets' },
            { name: 'Templates', value: 'templates' },
            { name: 'Settings', value: 'settings' },
            { name: 'Semua Data', value: 'all' }
          )
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('info')
      .setDescription('Tampilkan informasi storage dan statistik')
  )

// Product embed command
const productCommand = new SlashCommandBuilder()
  .setName('produk')
  .setDescription('Kelola embed produk dengan tombol beli dan CS')
  .addSubcommand(sub =>
    sub
      .setName('buat')
      .setDescription('Buat embed produk baru')
      .addStringOption(option =>
        option
          .setName('nama')
          .setDescription('Nama produk')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('jenis')
          .setDescription('Jenis/kategori produk')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('harga')
          .setDescription('Harga produk (contoh: Rp 50.000 atau $10.99)')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('deskripsi')
          .setDescription('Deskripsi produk (opsional)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('gambar')
          .setDescription('URL gambar produk (opsional)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('thumbnail')
          .setDescription('URL thumbnail produk (opsional)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('warna')
          .setDescription('Warna embed (hex code tanpa #, contoh: FF6B6B)')
          .setRequired(false)
      )
      .addChannelOption(option =>
        option
          .setName('channel_order')
          .setDescription('Channel order-ticket untuk tombol beli')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
      .addChannelOption(option =>
        option
          .setName('channel')
          .setDescription('Channel untuk mengirim embed (default: channel ini)')
          .setRequired(false)
          .addChannelTypes(ChannelType.GuildText)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('edit')
      .setDescription('Edit embed produk yang sudah ada')
      .addStringOption(option =>
        option
          .setName('message_id')
          .setDescription('ID pesan embed produk yang ingin diedit')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('nama')
          .setDescription('Nama produk baru (kosongkan jika tidak ingin mengubah)')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('jenis')
          .setDescription('Jenis produk baru')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('harga')
          .setDescription('Harga produk baru')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('deskripsi')
          .setDescription('Deskripsi produk baru')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('gambar')
          .setDescription('URL gambar produk baru')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('thumbnail')
          .setDescription('URL thumbnail produk baru')
          .setRequired(false)
      )
      .addStringOption(option =>
        option
          .setName('warna')
          .setDescription('Warna embed baru (hex code tanpa #)')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('list')
      .setDescription('Lihat daftar semua produk yang dibuat')
      .addBooleanOption(option =>
        option
          .setName('detail')
          .setDescription('Tampilkan detail lengkap produk')
          .setRequired(false)
      )
  )
  .addSubcommand(sub =>
    sub
      .setName('hapus')
      .setDescription('Hapus embed produk')
      .addStringOption(option =>
        option
          .setName('message_id')
          .setDescription('ID pesan embed produk yang ingin dihapus')
          .setRequired(true)
      )
      .addStringOption(option =>
        option
          .setName('konfirmasi')
          .setDescription('Ketik "HAPUS" untuk mengkonfirmasi penghapusan')
          .setRequired(true)
      )
  )

// Server status command
const statusCommand = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Tampilkan status server dan bot')
  .addStringOption(option =>
    option
      .setName('type')
      .setDescription('Jenis informasi status yang ingin ditampilkan')
      .setRequired(false)
      .addChoices(
        { name: '🤖 Bot Status', value: 'bot' },
        { name: '🏢 Server Info', value: 'server' },
        { name: '📊 Statistics', value: 'stats' },
        { name: '🔧 System Info', value: 'system' },
        { name: '📋 Lengkap', value: 'full' }
      )
  )

// Help command
const helpCommand = new SlashCommandBuilder()
  .setName('help')
  .setDescription('Tampilkan bantuan dan daftar semua command yang tersedia')
  .addStringOption(option =>
    option
      .setName('command')
      .setDescription('Pilih command untuk melihat detail lengkap')
      .setRequired(false)
      .addChoices(
        { name: '🎫 /ticket - Kelola tiket support', value: 'ticket' },
        { name: '👤 /role - Kelola role member', value: 'role' },
        { name: '📝 /embed - Buat dan kelola embed', value: 'embed' },
        { name: '💾 /data - Kelola data bot', value: 'data' },
        { name: '🛍️ /produk - Kelola embed produk', value: 'produk' },
        { name: '📊 /status - Lihat status server', value: 'status' },
        { name: '🔒 /closeticket - Tutup tiket cepat', value: 'closeticket' },
        { name: '🗃️ /viewarchive - Lihat arsip tiket', value: 'viewarchive' }
      )
  )
  .addBooleanOption(option =>
    option
      .setName('show_admin')
      .setDescription('Tampilkan command khusus admin (hanya untuk admin/owner)')
      .setRequired(false)
  )

// Export all commands
const commands = [
  ticketCommand.toJSON(),
  roleCommand.toJSON(),
  embedCommand.toJSON(),
  dataCommand.toJSON(),
  productCommand.toJSON(),
  statusCommand.toJSON(),
  helpCommand.toJSON(),
  closeTicketCommand.toJSON(),
  viewArchiveCommand.toJSON()
]

// Register commands function
async function registerCommands(guild) {
  try {
    await guild.commands.set(commands)
    console.log('✅ Slash commands registered successfully')
    return true
  } catch (error) {
    console.error('❌ Failed to register commands:', error)
    return false
  }
}

// Get command by name
function getCommand(commandName) {
  const commandMap = {
    'ticket': ticketCommand,
    'role': roleCommand,
    'embed': embedCommand,
    'data': dataCommand,
    'produk': productCommand,
    'status': statusCommand,
    'help': helpCommand,
    'closeticket': closeTicketCommand,
    'viewarchive': viewArchiveCommand
  }
  
  return commandMap[commandName] || null
}

// Get all command names
function getCommandNames() {
  return ['ticket', 'role', 'embed', 'data', 'produk', 'status', 'help', 'closeticket', 'viewarchive']
}

// Validate command options
function validateCommandOptions(commandName, options) {
  const command = getCommand(commandName)
  if (!command) {
    return { isValid: false, error: 'Command not found' }
  }
  
  // Basic validation - can be extended as needed
  return { isValid: true }
}

module.exports = {
  // Command definitions
  ticketCommand,
  roleCommand,
  embedCommand,
  dataCommand,
  productCommand,
  statusCommand,
  helpCommand,
  closeTicketCommand,
  viewArchiveCommand,
  
  // Command arrays
  commands,
  
  // Utility functions
  registerCommands,
  getCommand,
  getCommandNames,
  validateCommandOptions
}