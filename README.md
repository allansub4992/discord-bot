# Discord Ticket Bot Setup Guide

## Prerequisites
- Node.js installed on your system
- A Discord application and bot created at https://discord.com/allansub

## Setup Instructions

### 1. Install Dependencies
Dependencies are already installed, but if you need to reinstall:
```bash
npm install
```

### 2. Configure Environment Variables
1. Edit the `.env` file in this directory
2. Replace the placeholder values with your actual Discord bot configuration:

**Required Values:**
- `DISCORD_TOKEN`: Your bot token from Discord Developer Portal
- `GUILD_ID`: Your Discord server ID (right-click server name → Copy Server ID)

**Optional Values (have defaults):**
- `OWNER_IDS`: Your Discord user ID for owner permissions (comma-separated for multiple owners)
- `ADMIN_ROLE`: Name of admin role (default: "Admin")
- `SELLER_ROLE`: Name of seller role (default: "Seller") 
- `BUYER_ROLE`: Name of buyer role (default: "Buyer")
- `SUPPORT_ROLE`: Name of support role (default: "Support")

### 3. Get Your Discord IDs

**Bot Token:**
1. Go to https://discord.com/developers/applications
2. Select your application → Bot section
3. Copy the token

**Guild (Server) ID:**
1. Enable Developer Mode in Discord (User Settings → Advanced → Developer Mode)
2. Right-click your server name → Copy Server ID

**User ID:**
1. Right-click your username in Discord → Copy User ID

### 4. Bot Permissions
Make sure your bot has these permissions in your Discord server:
- Manage Channels
- Manage Roles
- Send Messages
- Read Message History
- Use Slash Commands

### 5. Run the Bot
```bash
npm start
```
or
```bash
node main.js
```

## Features

### 🆘 Help System (NEW!)
- `/help` - Complete command reference and interactive help
- `/help command:<command_name>` - Detailed help for specific commands
- `/help show_admin:true` - View admin commands (reference only)
- **Smart Permission Display**: Shows different content based on your role
- **Interactive Examples**: Copy-paste ready command examples
- **Category Organization**: Commands grouped by functionality
- **Real-time Permission Checking**: See exactly what you can access

### 🎫 Ticket System
- `/ticket open` - Create a new support ticket
- `/ticket close` - Close current ticket
- `/ticket rename <name>` - Rename current ticket
- `/ticket archive` - Archive ticket (admin/owner only)
- `/ticket delete` - Delete ticket (admin/owner only)
- `/ticket setup <channel>` - Setup ticket creation channel with button
- `/ticket permissions [channel]` - Check bot permissions
- `/ticket botinfo` - Show detailed bot information

### 👥 Role Management
- `/role assign <user> <role>` - Assign role to user (admin/owner only)
- `/role remove <user> <role>` - Remove role from user (admin/owner only)

### 🎨 Embed System
- `/embed create` - Create basic custom embed
- `/embed advanced` - Create advanced embed with fields
- `/embed template` - Use built-in templates (announcement, success, warning, etc.)
- `/embed edit <message_id>` - Edit existing embeds
- `/embed save <name>` - Save custom template
- `/embed load <name>` - Load saved template
- `/embed list` - View all templates and embeds
- `/embed delete <name>` - Delete saved template
- `/embed stats` - View embed usage statistics

### 🛍️ Product Embed System (NEW!)
- `/produk nama:<name> jenis:<type> harga:<price>` - Create product embed with buy/CS buttons
- Interactive buttons for:
  - **🛒 Beli Sekarang** - Direct to order channel or create order ticket
  - **🎧 Hubungi CS** - Create customer service ticket
- Customizable: description, images, colors, order channels
- Auto-creates specialized tickets (order/CS) with proper permissions
- Full Indonesian interface for better user experience

### 💾 Data Management
- `/data backup` - Create complete data backup
- `/data restore <file>` - Restore from backup
- `/data clear <type>` - Clear specific data types
- `/data export <type>` - Export data in readable format
- `/data info` - View storage information and statistics

### 📊 Local Storage System
- Auto-save every 5 minutes
- Persistent data storage in JSON format
- Comprehensive backup and restore functionality
- Real-time statistics and monitoring

## Quick Start

### 🆘 Need Help?
Type `/help` in your Discord server to see all available commands with interactive examples!

### 🛍️ Product Embed

Create beautiful product showcases with interactive buttons:

```bash
# Basic product embed
/produk nama:"Gaming Mouse Pro" jenis:"Gaming Accessory" harga:"Rp 299.000"

# Advanced product embed with image and custom channel
/produk nama:"Premium Discord Bot" jenis:"Digital Service" harga:"$49.99" deskripsi:"Full-featured Discord bot with 24/7 support" gambar:"https://example.com/bot.jpg" warna:"7289DA" channel_order:#premium-orders
```

Users can then:
- 🛒 Click **Beli Sekarang** to be directed to order channel or create order ticket
- 🎧 Click **Hubungi CS** to create customer service ticket

## Documentation

- **[Help Command Guide](HELP_COMMAND_GUIDE.md)** - Complete guide for the new help system
- **[Product Embed Guide](PRODUCT_EMBED_GUIDE.md)** - Complete guide for product embed system
- **[Product Examples](PRODUCT_EXAMPLES.md)** - Example commands for different product types
- **[Embed Commands](EMBED_COMMANDS.md)** - Complete embed system documentation
- **[Local Storage Guide](LOCAL_STORAGE_GUIDE.md)** - Data management and storage
- **[Installation Guide](INSTALLATION_AND_USAGE_GUIDE.md)** - Complete setup instructions

## Troubleshooting
- Ensure all environment variables are set correctly
- Check that the bot has proper permissions in your Discord server
- Verify that the role names match exactly with your server roles
- Make sure Developer Mode is enabled to copy IDs
