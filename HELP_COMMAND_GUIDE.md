# Help Command Guide

## Overview
The `/help` command provides comprehensive assistance for all Discord bot commands. This command interacts with all modules in your bot system and provides detailed information about every available command.

## Features

### 🎯 Main Help Command
- **Usage**: `/help`
- **Description**: Shows an overview of all available commands categorized by function
- **Permissions**: Available to all users (shows different content based on user permissions)

### 📖 Detailed Command Help
- **Usage**: `/help command:<command_name>`
- **Description**: Shows detailed information about a specific command including usage, examples, and notes
- **Examples**:
  - `/help command:ticket`
  - `/help command:embed create`
  - `/help command:produk buat`

### 🛡️ Admin Command Display
- **Usage**: `/help show_admin:true`
- **Description**: Shows admin-only commands even if you don't have admin permissions (for reference)
- **Note**: Commands will be marked with 🔒 if you don't have permission

## Command Categories

### 🎯 General Commands
- `help` - This help system
- `status` - Server and bot status information

### 🎫 Ticket Management
- `ticket open` - Create new support ticket
- `ticket close` - Close current ticket
- `ticket rename` - Rename current ticket
- `closeticket` - Quick ticket closure

### 📝 Embed System (Admin/Editor)
- `embed create` - Basic embed creation
- `embed advanced` - Advanced embed with fields
- `embed template` - Use built-in templates
- `embed edit` - Edit existing embeds
- `embed save` - Save custom templates
- `embed load` - Load saved templates

### 🛍️ Product Management (Admin/Editor)
- `produk buat` - Create product embeds with buy buttons
- `produk edit` - Edit existing product embeds
- `produk list` - List all products
- `produk hapus` - Delete product embeds

### 🛡️ Admin Commands
- `ticket setup` - Setup ticket creation channel
- `ticket archive` - Archive tickets
- `ticket delete` - Delete tickets permanently
- `role assign/remove` - Manage user roles
- `data backup/clear` - Data management

## Integration with Bot Systems

The help command integrates with all your bot modules:

### 🔗 Connection to main.js
The help command is registered in the main command array and handled through the interaction system in `main.js`.

### 🔗 Permission System Integration
- Automatically checks user permissions using `permissions.js`
- Shows different content based on user roles (Admin, Editor, User)
- Marks restricted commands with appropriate indicators

### 🔗 Storage System Integration
- Uses the same storage system as other bot modules
- Provides information about data management commands
- Shows statistics and counts from the storage system

### 🔗 Embed System Integration
- Uses the same embed styling as other bot commands
- Provides detailed help for all embed-related commands
- Shows available templates and customization options

### 🔗 Product System Integration
- Explains product management workflow
- Shows how to create and manage product embeds
- Details the buy button and CS functionality

### 🔗 Ticket System Integration
- Explains complete ticket workflow
- Shows commands for ticket creation, management, and closure
- Details admin-only ticket operations

## Examples

### Basic Usage
```
/help
```
Shows main help overview with all categories.

### Specific Command Help
```
/help command:embed create
```
Shows detailed help for the embed create command including:
- Full usage syntax
- Parameter explanations
- Multiple examples
- Important notes and warnings

### Admin Reference
```
/help show_admin:true
```
Shows all commands including admin-only ones (marked with 🔒 if you don't have permission).

## Technical Implementation

### Files Modified
1. **`src/commands.js`** - Added helpCommand definition
2. **`src/handlers.js`** - Added handleHelpCommand function
3. **`src/help.js`** - New module containing all help functionality

### Key Features
- **Dynamic Permission Checking**: Shows different content based on user roles
- **Comprehensive Command Database**: Complete information about all commands
- **Interactive Examples**: Copy-paste ready command examples
- **Category-based Organization**: Commands grouped logically
- **Rich Embed Formatting**: Uses the same styling system as the rest of the bot

### Error Handling
- Handles unknown commands gracefully
- Shows permission denied messages for restricted commands
- Provides suggestions when commands are not found

## Tips for Users

1. **Use Tab Completion**: Discord's autocomplete helps with command names
2. **Check Examples**: Each command help includes copy-paste ready examples
3. **Understand Parameters**: `<required>` vs `[optional]` parameter notation
4. **Permission Awareness**: Commands show your permission level clearly
5. **Quick Reference**: Use `/help command:<name>` for specific command details

This help system ensures users can effectively discover and use all the powerful features of your Discord bot while maintaining proper permission boundaries and providing excellent user experience.