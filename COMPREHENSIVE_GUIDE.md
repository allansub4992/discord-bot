# 🤖 Discord Bot - Comprehensive Guide

## 📋 Table of Contents
1. [Installation & Setup](#-installation--setup)
2. [Local Storage System](#-local-storage-system)
3. [Embed Commands](#-embed-commands)
4. [Data Management](#-data-management) 
5. [Command Examples](#-command-examples)
6. [Templates & Testing](#-templates--testing)
7. [Best Practices](#-best-practices)
8. [Troubleshooting](#-troubleshooting)

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- Discord Bot Token
- Basic knowledge of Discord permissions

### Quick Setup
1. **Clone/Download** the bot files to your directory
2. **Install Dependencies**:
   ```bash
   npm install discord.js dotenv
   ```
3. **Environment Setup**:
   Create `.env` file:
   ```env
   DISCORD_TOKEN=your_bot_token_here
   ```
4. **Run the Bot**:
   ```bash
   node main.js
   ```

### File Structure
```
bot-discord/
├── data/                    # Auto-created storage directory
│   ├── embeds.json         # Embed data & statistics
│   ├── tickets.json        # Ticket data & tracking
│   ├── templates.json      # Custom templates
│   └── settings.json       # Bot settings
├── src/                    # Modular components
│   ├── commands.js         # Command definitions
│   ├── config.js           # Configuration management
│   ├── embed.js            # Embed functionality
│   ├── handlers.js         # Event handlers
│   ├── permissions.js      # Permission management
│   ├── product.js          # Product embed system
│   ├── storage.js          # Local storage system
│   └── ticket.js           # Ticket management
├── main.js                 # Main bot entry point
├── package.json            # Dependencies
├── .env                    # Environment variables
└── docs/                   # Documentation files
```

---

## 💾 Local Storage System

### 🎉 Features Overview

The Discord bot includes a comprehensive local storage system that provides:

#### ✅ Successfully Implemented Features

**💾 Core Storage System**
- **Data Directory**: `data/` folder for organized data storage
- **JSON Files**: 4 structured files for different data types
- **Auto-Save**: Automatic data saving every 5 minutes
- **Error Handling**: Robust error recovery and validation

**📁 Storage Structure**
```
data/
├── embeds.json      ✅ Embed data and statistics
├── tickets.json     ✅ Ticket data and tracking  
├── templates.json   ✅ Custom user templates
└── settings.json    ✅ Bot configuration
```

### 🗂️ Data Structure Details

#### 1. Embed Data (`embeds.json`)
```json
{
  "saved_embeds": {
    "message_id": {
      "config": { /* embed configuration */ },
      "author_id": "user_id",
      "channel_id": "channel_id", 
      "created_at": "2024-09-16T...",
      "edited_count": 0
    }
  },
  "statistics": {
    "total_created": 0,
    "total_edited": 0,
    "last_created": null
  }
}
```

#### 2. Ticket Data (`tickets.json`)
```json
{
  "active_tickets": {
    "channel_id": {
      "creator_id": "user_id",
      "creator_tag": "username#1234",
      "channel_name": "ticket-username-1234",
      "category": "active",
      "created_at": "2024-09-16T..."
    }
  },
  "closed_tickets": { /* similar structure */ },
  "statistics": {
    "total_created": 0,
    "total_closed": 0,
    "total_archived": 0
  }
}
```

#### 3. Templates Data (`templates.json`)
```json
{
  "custom_templates": {
    "template_name": {
      "title": "Template Title",
      "description": "Template Description",
      "color": "00AE86",
      "thumbnail": "url",
      "image": "url", 
      "footer": "Footer text",
      "author_id": "creator_user_id",
      "created_at": "2024-09-16T..."
    }
  }
}
```

#### 4. Settings Data (`settings.json`)
```json
{
  "guild_settings": {},
  "embed_defaults": {
    "color": "00AE86",
    "footer_text": "Powered by Discord Bot",
    "timestamp": true
  },
  "ticket_settings": {
    "auto_close_inactive": false,
    "inactive_hours": 24,
    "log_channel": null
  }
}
```

### 🔄 Auto-Save System

**Features:**
- **Interval**: Every 5 minutes
- **Trigger**: Automatically saves all changes
- **Security**: Backup before overwrite
- **Logging**: Records save/load activities

**Manual Save Triggers:**
Data is automatically saved whenever:
- Embeds are created, edited, or deleted
- Tickets are created, closed, or archived
- Custom templates are created or deleted
- Settings are modified

---

## 🎨 Embed Commands

### 🔑 Permissions
- Only **Admin** and **Owner** can use embed commands
- Bot requires **Send Messages** permission in target channel

### 📝 Available Commands

#### 1. `/embed create` - Create Basic Embed
Creates simple embed with basic customization options.

**Parameters:**
- `title` *(required)*: Embed title (max 256 characters)
- `description` *(required)*: Embed description (max 4096 characters)
- `color` *(optional)*: Embed color (hex code without #, example: 00AE86)
- `thumbnail` *(optional)*: Thumbnail image URL
- `image` *(optional)*: Main image URL
- `footer` *(optional)*: Footer text
- `channel` *(optional)*: Target channel (default: current channel)

**Example:**
```
/embed create title:"Selamat Datang!" description:"Terima kasih telah bergabung dengan server kami!" color:"1ABC9C"
```

#### 2. `/embed advanced` - Create Advanced Embed
Creates embed with full features including fields, author, and timestamp.

**Parameters:**
- `title` *(required)*: Embed title
- `description` *(optional)*: Embed description
- `color` *(optional)*: Embed color (hex code)
- `fields` *(optional)*: Fields in format: `Name1|Value1|true;Name2|Value2|false`
- `author` *(optional)*: Author name
- `author_icon` *(optional)*: Author icon URL
- `footer` *(optional)*: Footer text
- `footer_icon` *(optional)*: Footer icon URL
- `thumbnail` *(optional)*: Thumbnail image URL
- `image` *(optional)*: Main image URL
- `timestamp` *(optional)*: Add current timestamp
- `channel` *(optional)*: Target channel

**Field Format:**
- Use `|` to separate name, value, and inline
- Use `;` to separate different fields
- Inline: `true` or `false`
- Example: `Info|Informasi penting|true;Status|Online|false`

**Example:**
```
/embed advanced title:"Server Stats" fields:"Member|1,234 orang|true;Online|567 orang|true;Channel|25 channel|true" timestamp:true
```

#### 3. `/embed template` - Use Template
Uses predefined embed templates.

**Available Templates:**
- 📢 **Pengumuman** - Untuk pengumuman penting
- ✅ **Sukses** - Untuk notifikasi berhasil
- ⚠️ **Peringatan** - Untuk peringatan
- ❌ **Error** - Untuk notifikasi error
- ℹ️ **Informasi** - Untuk informasi umum
- 🎉 **Event** - Untuk pengumuman event
- 📝 **Aturan** - Untuk aturan server
- 👋 **Selamat Datang** - Untuk sambutan

**Parameters:**
- `type` *(required)*: Choose template from list
- `title` *(optional)*: Custom title (replaces default)
- `content` *(optional)*: Custom content (replaces default)
- `channel` *(optional)*: Target channel

**Example:**
```
/embed template type:"announcement" title:"Maintenance Server" content:"Server akan maintenance pada Minggu, 17 September pukul 02:00 WIB"
```

#### 4. `/embed save` - Save Custom Template
Saves embed configuration as reusable template.

**Parameters:**
- `name` *(required)*: Unique template name
- `title` *(required)*: Embed title
- `description` *(required)*: Embed description
- `color` *(optional)*: Hex color (without #)
- `thumbnail` *(optional)*: Thumbnail URL
- `image` *(optional)*: Image URL
- `footer` *(optional)*: Footer text

**Example:**
```
/embed save name:"welcome-template" title:"🎉 Selamat Datang!" description:"Selamat datang di server kami!" color:"1ABC9C" footer:"Welcome Team"
```

#### 5. `/embed load` - Load Saved Template
Loads and sends embed from saved template.

**Parameters:**
- `name` *(required)*: Template name to load
- `channel` *(optional)*: Target channel

**Example:**
```
/embed load name:"welcome-template"
```

#### 6. `/embed list` - List Templates
Displays all custom templates and embed statistics.

#### 7. `/embed delete` - Delete Template
Deletes custom template (creator or admin only).

**Parameters:**
- `name` *(required)*: Template name to delete

#### 8. `/embed stats` - Embed Statistics
Displays comprehensive embed usage statistics.

#### 9. `/embed edit` - Edit Embed
Edits existing embed (only embeds created by this bot).

**Parameters:**
- `message_id` *(required)*: ID of embed message to edit
- `title` *(optional)*: New title
- `description` *(optional)*: New description
- `color` *(optional)*: New color (hex code)

**How to get Message ID:**
1. Enable Developer Mode in Discord
2. Right-click on embed message
3. Select "Copy ID"

**Example:**
```
/embed edit message_id:"1234567890123456789" title:"Judul Baru" color:"E74C3C"
```

---

## 💾 Data Management

### Data Management Commands

#### `/data backup` - Create Backup
Creates a complete backup file of all bot data in JSON format.

**Features:**
- Automatic backup of all data
- Direct file download
- Includes timestamp and metadata
- Human-readable format

#### `/data export` - Export Specific Data
Export particular data types in readable format.

**Parameters:**
- `type` *(required)*: Data type (embeds, tickets, templates, settings, all)

**Examples:**
```
/data export type:"embeds"
/data export type:"all"
```

#### `/data clear` - Delete Data
Delete specific or all data (CAUTION REQUIRED!).

**Parameters:**
- `type` *(required)*: Data type to delete
- `confirm` *(required)*: Type "CONFIRM" for confirmation

**Examples:**
```
/data clear type:"embeds" confirm:"CONFIRM"
```

#### `/data info` - Storage Information
Displays detailed information about storage usage.

**Information displayed:**
- File size per category
- Amount of stored data
- Auto-save status
- Data directory location

---

## 🎯 Command Examples

### Quick Test Commands

#### 1. Test Basic Embed
```
/embed create title:"🎮 Welcome to Gaming Server" description:"Selamat datang di server gaming terbaik! Nikmati pengalaman gaming yang seru bersama kami." color:"1ABC9C" footer:"Powered by Custom Bot"
```

#### 2. Test Advanced Embed with Fields
```
/embed advanced title:"📊 Server Statistics" description:"Statistik server real-time" fields:"👥 Total Members|1,234 orang|true;🟢 Online Now|567 orang|true;💬 Total Channels|25 channels|true;🎮 Gaming Channels|8 channels|true;📢 Announcement|3 channels|true;🎵 Voice Channels|11 channels|true" color:"3498DB" timestamp:true
```

#### 3. Test Template - Announcement
```
/embed template type:"announcement" title:"🚀 Update Bot v2.0" content:"**Fitur Baru yang Ditambahkan:**

✨ Sistem embed custom yang powerful
🎨 8 template embed siap pakai  
⚙️ Advanced customization options
🔧 Edit embed yang sudah ada
📝 Field system untuk data terstruktur

**Cara Menggunakan:**
Gunakan `/embed` untuk melihat semua opsi yang tersedia!"
```

#### 4. Test Template - Event
```
/embed template type:"event" title:"🎉 Tournament Mobile Legends" content:"**Grand Tournament ML Season 2024**

🏆 **Total Hadiah: Rp 10.000.000**
📅 **Tanggal:** 25-27 September 2024
⏰ **Jam:** 19:00 - 22:00 WIB
👥 **Format:** 5v5 Elimination

**Pendaftaran:**
💰 Biaya: Rp 50.000/team
📝 Daftar: bit.ly/ml-tournament
📞 Contact: @admin

**Rules & Info:**
📋 Max rank: Mythic
🚫 No smurf account
✅ Screenshot required"
```

#### 5. Save and Load Custom Template
```
# Save template
/embed save name:"welcome-template" title:"🎉 Welcome!" description:"Welcome to our server!" color:"1ABC9C" footer:"Welcome Team"

# Load template
/embed load name:"welcome-template"
```

### Advanced Examples

#### Community Guidelines Embed
```
/embed advanced title:"📜 Community Guidelines" description:"Panduan lengkap untuk member server kami" fields:"🤝 Respect|Hormati semua member tanpa terkecuali|false;💬 Communication|Gunakan bahasa yang sopan dan konstruktif|false;🎮 Gaming|Fair play, no cheating, sportmanship|false;🔒 Privacy|Jangan share info pribadi orang lain|false;📢 Promotion|Dilarang promosi tanpa izin admin|false;⚖️ Consequences|Warning → Mute → Kick → Ban|false" color:"2C3E50" author:"Server Moderation Team" footer:"Last updated: September 2024" timestamp:true
```

#### Event Schedule Embed
```
/embed advanced title:"📅 Weekly Event Schedule" description:"Jadwal event mingguan server gaming" fields:"🎮 Monday|Game Night - Among Us|false;🏆 Tuesday|Tournament Qualifier|false;🎵 Wednesday|Music & Chill|false;🎯 Thursday|Trivia Competition|false;🎮 Friday|Free Fire Friday|false;🎉 Saturday|Community Event|false;😴 Sunday|Rest Day|false" color:"E67E22" thumbnail:"https://example.com/calendar.png" footer:"Semua waktu dalam WIB • Subject to change"
```

#### Bot Commands Help
```
/embed advanced title:"🤖 Bot Commands Guide" description:"Daftar lengkap perintah bot yang tersedia" fields:"🎫 Tickets|/ticket open, close, rename|true;👑 Roles|/role assign, remove|true;🎨 Embeds|/embed create, advanced, template|true;🔧 Setup|/ticket setup, permissions|true;📊 Info|/help, /ping, /stats|true;🛡️ Moderation|/warn, /mute, /kick, /ban|true" color:"7289DA" author:"Bot Command Center" author_icon:"https://example.com/bot-icon.png" footer:"Prefix: / (Slash Commands)" timestamp:true
```

---

## 🎨 Templates & Testing

### 8 Pre-defined Templates

#### 1. **Announcement Template**
- Color: Blue (#3498DB)
- Icon: 📢
- Use: Important server announcements

#### 2. **Success Template**
- Color: Green (#2ECC71)
- Icon: ✅
- Use: Success notifications, completions

#### 3. **Warning Template**
- Color: Yellow (#F39C12)
- Icon: ⚠️
- Use: Warnings, maintenance notices

#### 4. **Error Template**
- Color: Red (#E74C3C)
- Icon: ❌
- Use: Error notifications, issues

#### 5. **Info Template**
- Color: Purple (#9B59B6)
- Icon: ℹ️
- Use: General information

#### 6. **Event Template**
- Color: Orange (#FF6B6B)
- Icon: 🎉
- Use: Events, celebrations

#### 7. **Rules Template**
- Color: Dark Gray (#34495E)
- Icon: 📝
- Use: Server rules, guidelines

#### 8. **Welcome Template**
- Color: Teal (#1ABC9C)
- Icon: 👋
- Use: Welcome messages

### Color Codes Reference

| Color | Hex Code | Usage Example |
|-------|----------|---------------|
| Merah | E74C3C | Error, peringatan |
| Hijau | 2ECC71 | Sukses, berhasil |
| Biru | 3498DB | Informasi, pengumuman |
| Kuning | F39C12 | Peringatan |
| Ungu | 9B59B6 | Informasi khusus |
| Orange | FF6B6B | Event, promosi |
| Teal | 1ABC9C | Selamat datang |
| Dark Gray | 34495E | Aturan, formal |

### Testing Tips

1. **Test di Private Channel**: Buat channel khusus untuk testing agar tidak spam channel utama
2. **Check Permissions**: Pastikan bot punya permission yang diperlukan
3. **URL Testing**: Gunakan URL gambar yang valid untuk test thumbnail/image
4. **Color Testing**: Coba berbagai kombinasi warna hex
5. **Field Testing**: Test berbagai kombinasi inline true/false
6. **Edit Testing**: Save message ID untuk test command edit

---

## 💡 Best Practices

### 1. Regular Backups
- Perform weekly backups with `/data backup`
- Store backup files in safe location
- Test restore process periodically

### 2. Template Management
- Use descriptive template names
- Remove unused templates
- Document complex templates

### 3. Data Cleanup
- Monitor storage usage with `/data info`
- Remove old data periodically
- Archive unnecessary tickets

### 4. Security
- Only admins have data management access
- Backup data before major changes
- Use confirmation for destructive operations

### 5. Penggunaan Warna
- **Merah**: Error, peringatan serius
- **Kuning**: Peringatan ringan, maintenance
- **Hijau**: Sukses, konfirmasi
- **Biru**: Informasi netral, pengumuman
- **Ungu**: Fitur khusus, premium

### 6. Format Fields
- Gunakan inline `true` untuk field pendek yang bisa berdampingan
- Gunakan inline `false` untuk field panjang yang perlu baris sendiri
- Maksimal 3 field inline per baris

### 7. URL Gambar
- Gunakan URL langsung ke gambar (berakhiran .jpg, .png, .gif)
- Pastikan URL dapat diakses publik
- Recommended size: 1920x1080 untuk image, 320x320 untuk thumbnail

---

## 🔧 Troubleshooting

### Common Issues

#### "Bot tidak memiliki izin untuk mengirim pesan"
- Pastikan bot memiliki permission `Send Messages` di channel target
- Check role permissions dan channel overrides

#### "Format warna tidak valid"
- Gunakan format hex 6 digit tanpa # (contoh: 00AE86)
- Gunakan color picker online untuk mendapatkan hex code

#### "URL tidak valid"
- Pastikan URL dimulai dengan http:// atau https://
- Test URL di browser untuk memastikan dapat diakses

#### "Field terlalu panjang"
- Check character limits untuk setiap komponen
- Bagi konten panjang menjadi beberapa field

#### "Pesan tidak ditemukan" (saat edit)
- Pastikan message ID benar
- Pastikan pesan ada di channel yang sama
- Hanya bisa edit embed yang dibuat oleh bot ini

### File Permissions
If file read/write errors occur:
1. Ensure bot has write access to project folder
2. Check `data/` folder permissions
3. Restart bot if necessary

### Corrupted Data
If JSON files are corrupted:
1. Use latest backup
2. Delete problematic file (will be recreated)
3. Use `/data clear` to reset

### Storage Full
If storage is full:
1. Use `/data export` to backup important data
2. Remove old data with `/data clear`
3. Monitor file size with `/data info`

---

## 📐 Limitations
- **Judul**: Maksimal 256 karakter
- **Deskripsi**: Maksimal 4096 karakter
- **Fields**: Maksimal 25 field per embed
- **Field Name**: Maksimal 256 karakter
- **Field Value**: Maksimal 1024 karakter
- **Footer**: Maksimal 2048 karakter

---

## 🚀 Key Benefits

### 1. **Performance**
- Local data storage untuk ultra-fast access
- Periodic auto-save mencegah data loss
- Lazy loading untuk memory optimization

### 2. **Reliability**
- Readable dan editable JSON format
- Easy-to-use backup system
- Comprehensive error handling

### 3. **Scalability**
- Organized data structure
- Easy to add new features
- Multi-guild support ready

### 4. **User Experience**
- Powerful template system
- Informative statistics
- User-friendly commands

---

## 📈 Current Status

### ✅ Working Features
- [x] Local storage system initialized
- [x] Data directory created automatically
- [x] Embed save/load functionality  
- [x] Template management system
- [x] Data backup & export
- [x] Statistics tracking
- [x] Auto-save mechanism
- [x] Error handling & validation
- [x] Custom embed system with 8 templates
- [x] Advanced field support
- [x] Interactive button system
- [x] Product embed integration
- [x] Ticket system integration

### 🎯 Immediate Benefits
1. **Data Persistence**: All embed and ticket data stored permanently
2. **Template Reuse**: Create once, use multiple times
3. **Analytics**: Complete bot usage tracking
4. **Backup**: Easy and secure backup system
5. **Performance**: Ultra-fast data access from local storage

---

## 🎉 Conclusion

The comprehensive system successfully provides the bot with:
- **Persistent Storage** for all important data
- **Powerful Template System** that's reusable
- **Comprehensive Data Management** 
- **Analytics & Monitoring** for usage tracking
- **Easy Backup & Recovery** system
- **User-friendly Interface** in Indonesian language
- **Modular Architecture** for easy maintenance

Bot sekarang memiliki "memory" yang persisten dan dapat menyimpan preferensi, template, dan data pengguna untuk penggunaan jangka panjang! 🚀

**Status**: ✅ **SUCCESSFULLY IMPLEMENTED**

---

*This comprehensive guide covers installation, usage, local storage, embed commands, examples, and all features of your Discord bot. The bot is ready for production use with all systems fully functional!*