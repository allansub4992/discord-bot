# New Features Added to Discord Bot

This document describes the new features that have been added to the Discord bot, including product management commands and server status functionality.

## New Commands Added

### 1. Enhanced Product Management (`/produk`)

The `/produk` command has been enhanced with new subcommands:

#### `/produk buat` (Create Product)
- **Description**: Buat embed produk baru dengan tombol interaktif
- **Parameters**:
  - `nama` (required): Nama produk
  - `jenis` (required): Jenis/kategori produk
  - `harga` (required): Harga produk
  - `deskripsi` (optional): Deskripsi produk
  - `gambar` (optional): URL gambar produk
  - `thumbnail` (optional): URL thumbnail produk
  - `warna` (optional): Warna embed (hex code)
  - `channel_order` (optional): Channel order-ticket untuk tombol beli
  - `channel` (optional): Channel tujuan (default: channel saat ini)

#### `/produk edit` (Edit Product) 🆕
- **Description**: Edit embed produk yang sudah ada
- **Parameters**:
  - `message_id` (required): ID pesan embed produk yang ingin diedit
  - `nama` (optional): Nama produk baru
  - `jenis` (optional): Jenis produk baru
  - `harga` (optional): Harga produk baru
  - `deskripsi` (optional): Deskripsi produk baru
  - `gambar` (optional): URL gambar produk baru
  - `thumbnail` (optional): URL thumbnail produk baru
  - `warna` (optional): Warna embed baru

#### `/produk list` (List Products) 🆕
- **Description**: Lihat daftar semua produk yang dibuat
- **Parameters**:
  - `detail` (optional): Tampilkan detail lengkap produk (default: false)

#### `/produk hapus` (Delete Product) 🆕
- **Description**: Hapus embed produk
- **Parameters**:
  - `message_id` (required): ID pesan embed produk yang ingin dihapus
  - `konfirmasi` (required): Ketik "HAPUS" untuk mengkonfirmasi

### 2. Server Status Command (`/status`) 🆕

Command baru untuk menampilkan status server dan bot.

#### Parameters:
- `type` (optional): Jenis informasi status yang ingin ditampilkan
  - `bot`: Status bot saja
  - `server`: Informasi server saja
  - `stats`: Statistik penggunaan
  - `system`: Informasi sistem
  - `full`: Status lengkap (default)

#### Features:
- **Bot Status**: Uptime, ping, memory usage, permissions
- **Server Info**: Member count, channels, roles, boost level
- **Statistics**: Embed statistics, ticket statistics, storage info
- **System Info**: Runtime environment, data storage, connection info
- **Full Status**: Kombinasi semua informasi di atas

## Technical Implementation

### New Files Added:
1. **`src/status.js`**: Module untuk menangani status server dan bot
   - Functions untuk mengambil informasi bot dan server
   - Embed creators untuk berbagai jenis status
   - Utility functions untuk formatting

### Enhanced Files:
1. **`src/product.js`**: Ditambahkan fungsi-fungsi baru:
   - `editProductEmbed()`: Edit produk yang sudah ada
   - `getProductList()`: Ambil daftar semua produk
   - `createProductListEmbed()`: Buat embed daftar produk
   - `deleteProductEmbed()`: Hapus embed produk

2. **`src/commands.js`**: 
   - Enhanced `productCommand` dengan subcommands
   - Added `statusCommand`
   - Updated command exports

3. **`src/handlers.js`**: 
   - Enhanced `handleProductCommand()` untuk subcommands
   - Added `handleStatusCommand()`
   - Updated imports dan exports

## Security Features

### Permission Requirements:
- **Product Management**: Memerlukan role Admin atau Owner
- **Product Edit/Delete**: Hanya bisa edit/delete embed yang dibuat oleh bot
- **Status Command**: Dapat diakses oleh semua user (informasi umum)

### Validation:
- Validasi input untuk semua parameter produk
- Validasi URL untuk gambar dan thumbnail
- Validasi format warna hex
- Konfirmasi penghapusan dengan keyword "HAPUS"

## Usage Examples

### Creating a Product:
```
/produk buat nama:"Gaming Laptop" jenis:"Electronics" harga:"Rp 15.000.000" deskripsi:"High-end gaming laptop"
```

### Editing a Product:
```
/produk edit message_id:"1234567890" harga:"Rp 14.500.000" deskripsi:"Updated description"
```

### Listing Products:
```
/produk list detail:true
```

### Checking Server Status:
```
/status type:full
```

## Data Storage

### Product Data:
- All product embeds are stored in `data/embeds.json`
- Each product has a unique message ID as identifier
- Includes creation timestamp and edit count
- Supports soft deletion (marked as deleted but preserved)

### Status Data:
- Real-time information from Discord API
- Storage statistics from local files
- System information from Node.js process

## Error Handling

### Product Commands:
- Validation errors for missing required fields
- URL validation for images
- Permission checks for editing/deleting
- Graceful handling of deleted messages

### Status Commands:
- Fallback for missing information
- Error handling for API failures
- Safe defaults for unavailable data

## Indonesian Language Support

All new features maintain the existing Indonesian language preference:
- Command descriptions in Indonesian
- Error messages in Indonesian
- Embed titles and content in Indonesian
- Help text and feedback in Indonesian

This ensures consistency with the existing bot interface and follows the project specification for Indonesian language localization.