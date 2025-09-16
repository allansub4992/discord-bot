# Auto-Archive Ticket System

## 📋 Overview

The Discord bot now includes an **automatic ticket archiving system** that saves all ticket data to local storage when tickets are closed. This ensures that no ticket information is lost and provides easy access to historical ticket data.

## 🔧 Features

### ✅ Auto-Archive on Close
- **Automatic Archiving**: When any ticket is closed using `/closeticket` or the ticket close commands, it automatically gets archived to local storage
- **Direct to Archive**: Tickets are moved directly from "Active" to "Archive" category and stored in the archived tickets database
- **Comprehensive Data**: All ticket information including creator, creation time, close time, and type is preserved

### 📁 Local Storage Integration
- **Persistent Storage**: All archived tickets are saved to `data/tickets.json` under the `archived_tickets` section
- **Real-time Updates**: Storage is updated immediately when tickets are archived
- **Data Structure**: Each archived ticket includes:
  - Creator ID and tag
  - Channel name and ID
  - Ticket type (general, order, cs)
  - Creation timestamp
  - Archive timestamp
  - Who archived it
  - Whether it was auto-archived or manually archived

### 🖥️ Archive Management Commands
- **`/viewarchive all`**: View all archived tickets
- **`/viewarchive user <user>`**: View archived tickets for a specific user
- **`/viewarchive stats`**: View comprehensive archive statistics

## 🚀 How It Works

### Automatic Process
1. User runs `/closeticket` or ticket close command
2. Bot immediately moves ticket to archive category
3. Channel is renamed with "archived-" prefix
4. Ticket data is saved to local storage with archive information
5. User permissions are updated (no send messages)
6. Confirmation embed is sent showing archive details

### Data Storage Structure
```json
{
  "archived_tickets": {
    "channel_id": {
      "creator_id": "user_id",
      "creator_tag": "username#1234",
      "channel_name": "ticket-username-1234",
      "category": "active",
      "type": "general",
      "created_at": "2025-09-16T12:00:00.000Z",
      "closed_at": "2025-09-16T13:00:00.000Z",
      "closed_by": "admin_user_id",
      "archived_at": "2025-09-16T13:00:00.000Z",
      "archived_by": "admin_user_id",
      "auto_archived": true
    }
  }
}
```

## 📊 Benefits

### For Administrators
- **Complete Audit Trail**: Never lose ticket history
- **Easy Retrieval**: Quick access to any past ticket information
- **Statistics**: Comprehensive stats on ticket usage and archiving
- **Search Capability**: Find tickets by user or timeframe

### For Users
- **Seamless Experience**: Archiving happens automatically without additional steps
- **Quick Closure**: Single command closes and archives tickets
- **Status Transparency**: Clear feedback when tickets are archived

## 🎯 Commands Usage

### Basic Archive Viewing
```
/viewarchive all
```
Shows all archived tickets with pagination

### User-Specific Archives
```
/viewarchive user @username
```
Shows all archived tickets created by a specific user

### Archive Statistics
```
/viewarchive stats
```
Displays comprehensive statistics about the archive system including:
- Total archived tickets
- Auto vs manual archives
- Recent archive activity
- Storage information

## 🔒 Permission Requirements
- Archive viewing commands require **Administrator** permissions
- Only admins/owners can use `/viewarchive` commands
- Regular users can still close their own tickets (which auto-archives)

## 💾 Technical Details

### Storage Location
- File: `data/tickets.json`
- Section: `archived_tickets`
- Format: JSON with UTF-8 encoding

### Backup Considerations
- Archive data is included in all data backup operations
- Archived tickets persist through bot restarts
- Can be exported/imported with other bot data

## 🔄 Migration Notes

### Existing Tickets
- Tickets that were closed before this update remain in `closed_tickets`
- New tickets closed after the update go directly to `archived_tickets`
- Manual archiving still available for moving old closed tickets to archive

### Storage Transition
- The system maintains backward compatibility
- Both `closed_tickets` and `archived_tickets` are supported
- Archive commands can view both categories as needed

---

**Note**: This auto-archive system ensures that no ticket data is ever lost while keeping the Discord server organized and clean. All ticket interactions are now preserved permanently in local storage for easy access and analysis.