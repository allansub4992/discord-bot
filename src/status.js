/**
 * Status Module
 * Handles server status and bot information commands
 */

const { EmbedBuilder, version: djsVersion } = require('discord.js')
const { config } = require('./config')
const { getStorageInfo, getEmbedStats, getTicketStats } = require('./storage')
const { checkBotPermissions } = require('./permissions')

// Get bot status information
function getBotStatus(client, guild) {
  const botMember = guild.members.me
  const uptime = client.uptime
  const users = client.users.cache.size
  const guilds = client.guilds.cache.size
  const channels = client.channels.cache.size
  
  const uptimeString = formatUptime(uptime)
  const memoryUsage = process.memoryUsage()
  const memoryUsed = Math.round(memoryUsage.heapUsed / 1024 / 1024)
  const memoryTotal = Math.round(memoryUsage.heapTotal / 1024 / 1024)
  
  return {
    tag: client.user.tag,
    id: client.user.id,
    avatar: client.user.displayAvatarURL(),
    uptime: uptimeString,
    ping: client.ws.ping,
    users,
    guilds,
    channels,
    memory: `${memoryUsed}MB / ${memoryTotal}MB`,
    nodeVersion: process.version,
    djsVersion,
    joinedAt: botMember.joinedAt,
    permissions: checkBotPermissions(guild)
  }
}

// Get server information
function getServerInfo(guild) {
  const owner = guild.members.cache.get(guild.ownerId)
  const totalMembers = guild.memberCount
  const onlineMembers = guild.members.cache.filter(member => member.presence?.status !== 'offline').size
  const bots = guild.members.cache.filter(member => member.user.bot).size
  const humans = totalMembers - bots
  
  const textChannels = guild.channels.cache.filter(ch => ch.type === 0).size
  const voiceChannels = guild.channels.cache.filter(ch => ch.type === 2).size
  const categories = guild.channels.cache.filter(ch => ch.type === 4).size
  
  const roles = guild.roles.cache.size
  const emojis = guild.emojis.cache.size
  const boostLevel = guild.premiumTier
  const boostCount = guild.premiumSubscriptionCount
  
  return {
    name: guild.name,
    id: guild.id,
    icon: guild.iconURL(),
    owner: owner ? owner.user.tag : 'Unknown',
    ownerId: guild.ownerId,
    created: guild.createdAt,
    memberCount: totalMembers,
    onlineMembers,
    humans,
    bots,
    channels: {
      text: textChannels,
      voice: voiceChannels,
      categories,
      total: guild.channels.cache.size
    },
    roles,
    emojis,
    boostLevel,
    boostCount,
    features: guild.features,
    verificationLevel: guild.verificationLevel
  }
}

// Get system statistics
function getSystemStats(client) {
  const embedStats = getEmbedStats()
  const ticketStats = getTicketStats()
  const storageInfo = getStorageInfo()
  
  return {
    embedStats,
    ticketStats,
    storageInfo,
    commands: client.application?.commands?.cache?.size || 0
  }
}

// Create bot status embed
function createBotStatusEmbed(client, guild) {
  const botStatus = getBotStatus(client, guild)
  const hasAdmin = guild.members.me.permissions.has('Administrator')
  
  const embed = new EmbedBuilder()
    .setTitle('🤖 Status Bot')
    .setDescription(`**${botStatus.tag}** (${botStatus.id})`)
    .setColor(hasAdmin ? config.embeds.successColor : config.embeds.warningColor)
    .setThumbnail(botStatus.avatar)
    .addFields(
      {
        name: '📊 Statistik Dasar',
        value: [
          `⏱️ **Uptime:** ${botStatus.uptime}`,
          `🏓 **Ping:** ${botStatus.ping}ms`,
          `👥 **Users:** ${botStatus.users}`,
          `🌐 **Servers:** ${botStatus.guilds}`,
          `📝 **Channels:** ${botStatus.channels}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '🔧 Informasi Sistem',
        value: [
          `💾 **Memory:** ${botStatus.memory}`,
          `🟢 **Node.js:** ${botStatus.nodeVersion}`,
          `📚 **Discord.js:** v${botStatus.djsVersion}`,
          `📅 **Bergabung:** <t:${Math.floor(botStatus.joinedAt.getTime() / 1000)}:R>`
        ].join('\\n'),
        inline: true
      },
      {
        name: '🛡️ Status Permissions',
        value: hasAdmin ? 
          '✅ **Administrator** - Semua izin tersedia' :
          '⚠️ **Terbatas** - Gunakan `/ticket permissions` untuk detail',
        inline: false
      }
    )
    .setFooter({ 
      text: `Status: ${client.user.presence?.status || 'online'} | Shard: ${guild.shardId || 0}`,
      iconURL: guild.iconURL()
    })
    .setTimestamp()
  
  return embed
}

// Create server info embed
function createServerInfoEmbed(guild) {
  const serverInfo = getServerInfo(guild)
  
  const embed = new EmbedBuilder()
    .setTitle('🏢 Informasi Server')
    .setDescription(`**${serverInfo.name}** (${serverInfo.id})`)
    .setColor(config.embeds.defaultColor)
    .setThumbnail(serverInfo.icon)
    .addFields(
      {
        name: '👑 Owner & Umum',
        value: [
          `👤 **Owner:** ${serverInfo.owner}`,
          `📅 **Dibuat:** <t:${Math.floor(serverInfo.created.getTime() / 1000)}:F>`,
          `🔒 **Verification:** Level ${serverInfo.verificationLevel}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '👥 Member Statistics',
        value: [
          `📊 **Total:** ${serverInfo.memberCount}`,
          `🟢 **Online:** ${serverInfo.onlineMembers}`,
          `👨‍💼 **Humans:** ${serverInfo.humans}`,
          `🤖 **Bots:** ${serverInfo.bots}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '📝 Channels & Content',
        value: [
          `💬 **Text:** ${serverInfo.channels.text}`,
          `🔊 **Voice:** ${serverInfo.channels.voice}`,
          `📁 **Categories:** ${serverInfo.channels.categories}`,
          `🎭 **Roles:** ${serverInfo.roles}`,
          `😀 **Emojis:** ${serverInfo.emojis}`
        ].join('\\n'),
        inline: true
      }
    )
    .setFooter({ 
      text: `Boost Level: ${serverInfo.boostLevel} | Boosts: ${serverInfo.boostCount}`,
      iconURL: guild.iconURL()
    })
    .setTimestamp()

  if (serverInfo.features.length > 0) {
    const features = serverInfo.features.slice(0, 10).map(f => f.toLowerCase().replace(/_/g, ' ')).join(', ')
    embed.addFields({
      name: '✨ Server Features',
      value: features,
      inline: false
    })
  }
  
  return embed
}

// Create statistics embed
function createStatsEmbed(client, guild) {
  const stats = getSystemStats(client)
  
  const embed = new EmbedBuilder()
    .setTitle('📊 Statistik Bot')
    .setColor(config.embeds.infoColor)
    .addFields(
      {
        name: '📝 Embed Statistics',
        value: [
          `📊 **Total Dibuat:** ${stats.embedStats.total_created}`,
          `✏️ **Total Diedit:** ${stats.embedStats.total_edited}`,
          `🕒 **Terakhir:** ${stats.embedStats.last_created ? 
            `<t:${Math.floor(new Date(stats.embedStats.last_created).getTime() / 1000)}:R>` : 
            'Belum ada'}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '🎫 Ticket Statistics',
        value: [
          `🆕 **Total Dibuat:** ${stats.ticketStats.total_created}`,
          `🔒 **Total Ditutup:** ${stats.ticketStats.total_closed}`,
          `📂 **Total Diarsip:** ${stats.ticketStats.total_archived}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '💾 Storage Info',
        value: [
          `📝 **Saved Embeds:** ${stats.storageInfo.counts.saved_embeds}`,
          `🎫 **Active Tickets:** ${stats.storageInfo.counts.active_tickets}`,
          `🎨 **Custom Templates:** ${stats.storageInfo.counts.custom_templates}`,
          `⚡ **Commands:** ${stats.commands}`
        ].join('\\n'),
        inline: true
      }
    )
    .setFooter({ text: 'Statistik dihitung sejak bot terakhir restart' })
    .setTimestamp()
  
  return embed
}

// Create system info embed
function createSystemInfoEmbed(client, guild) {
  const botStatus = getBotStatus(client, guild)
  const stats = getSystemStats(client)
  
  const totalSize = Object.values(stats.storageInfo.sizes).reduce((a, b) => a + b, 0)
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
  
  const embed = new EmbedBuilder()
    .setTitle('🔧 System Information')
    .setColor(config.embeds.warningColor)
    .addFields(
      {
        name: '💻 Runtime Environment',
        value: [
          `🟢 **Node.js:** ${botStatus.nodeVersion}`,
          `📚 **Discord.js:** v${botStatus.djsVersion}`,
          `💾 **Memory Usage:** ${botStatus.memory}`,
          `⏱️ **Process Uptime:** ${botStatus.uptime}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '📁 Data Storage',
        value: [
          `📊 **Total Size:** ${formatBytes(totalSize)}`,
          `📝 **Embeds:** ${formatBytes(stats.storageInfo.sizes.embeds)}`,
          `🎫 **Tickets:** ${formatBytes(stats.storageInfo.sizes.tickets)}`,
          `🎨 **Templates:** ${formatBytes(stats.storageInfo.sizes.templates)}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '🌐 Connection Info',
        value: [
          `🏓 **WebSocket Ping:** ${botStatus.ping}ms`,
          `🔗 **Shard ID:** ${guild.shardId || 0}`,
          `📡 **Status:** ${client.user.presence?.status || 'online'}`,
          `⚡ **Ready Since:** <t:${Math.floor(client.readyTimestamp / 1000)}:R>`
        ].join('\\n'),
        inline: false
      }
    )
    .setFooter({ text: `Data Path: ${stats.storageInfo.paths.dataDir}` })
    .setTimestamp()
  
  return embed
}

// Create comprehensive status embed
function createFullStatusEmbed(client, guild) {
  const botStatus = getBotStatus(client, guild)
  const serverInfo = getServerInfo(guild)
  const stats = getSystemStats(client)
  const hasAdmin = guild.members.me.permissions.has('Administrator')
  
  const embed = new EmbedBuilder()
    .setTitle('📋 Status Lengkap')
    .setDescription(`Bot: **${botStatus.tag}** | Server: **${serverInfo.name}**`)
    .setColor(config.embeds.successColor)
    .setThumbnail(client.user.displayAvatarURL())
    .addFields(
      {
        name: '🤖 Bot Overview',
        value: [
          `⏱️ Uptime: ${botStatus.uptime}`,
          `🏓 Ping: ${botStatus.ping}ms`,
          `🛡️ Permissions: ${hasAdmin ? '✅ Admin' : '⚠️ Limited'}`,
          `💾 Memory: ${botStatus.memory}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '🏢 Server Overview',
        value: [
          `👥 Members: ${serverInfo.memberCount}`,
          `📝 Channels: ${serverInfo.channels.total}`,
          `🎭 Roles: ${serverInfo.roles}`,
          `⭐ Boost: Level ${serverInfo.boostLevel}`
        ].join('\\n'),
        inline: true
      },
      {
        name: '📊 Activity Stats',
        value: [
          `📝 Embeds: ${stats.embedStats.total_created}`,
          `🎫 Tickets: ${stats.ticketStats.total_created}`,
          `🎨 Templates: ${stats.storageInfo.counts.custom_templates}`,
          `⚡ Commands: ${stats.commands}`
        ].join('\\n'),
        inline: true
      }
    )
    .setFooter({ 
      text: `${client.user.username} | Status: Active | Node.js ${process.version}`,
      iconURL: guild.iconURL()
    })
    .setTimestamp()
  
  return embed
}

// Utility function to format uptime
function formatUptime(uptime) {
  if (!uptime) return 'Unknown'
  
  const seconds = Math.floor((uptime / 1000) % 60)
  const minutes = Math.floor((uptime / (1000 * 60)) % 60)
  const hours = Math.floor((uptime / (1000 * 60 * 60)) % 24)
  const days = Math.floor(uptime / (1000 * 60 * 60 * 24))
  
  const parts = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)
  if (seconds > 0 && days === 0) parts.push(`${seconds}s`)
  
  return parts.join(' ') || '0s'
}

module.exports = {
  // Status functions
  getBotStatus,
  getServerInfo,
  getSystemStats,
  
  // Embed creators
  createBotStatusEmbed,
  createServerInfoEmbed,
  createStatsEmbed,
  createSystemInfoEmbed,
  createFullStatusEmbed,
  
  // Utilities
  formatUptime
}