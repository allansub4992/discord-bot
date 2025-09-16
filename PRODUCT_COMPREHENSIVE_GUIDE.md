# 🛍️ Product Embed System - Comprehensive Guide

## 📋 Table of Contents
1. [Overview & Features](#-overview--features)
2. [How to Use](#-how-to-use)
3. [Button Functionality](#-button-functionality)
4. [Visual Customization](#-visual-customization)
5. [Product Examples](#-product-examples)
6. [Security & Permissions](#-security--permissions)
7. [Data Storage](#-data-storage)
8. [Best Practices](#-best-practices)
9. [Troubleshooting](#-troubleshooting)

---

## 🎉 Overview & Features

Sistem embed produk memungkinkan admin dan owner untuk membuat embed khusus untuk menampilkan produk dengan tombol interaktif untuk pembelian dan customer service.

### 📋 Main Features

- ✨ **Professional Product Embeds** - Attractive display with complete product information
- 🛒 **Buy Now Button** - Direct link to order-ticket channel or automatic order ticket creation
- 🎧 **Contact CS Button** - Creates customer service ticket for inquiries
- 🎨 **Full Customization** - Colors, images, thumbnails, and descriptions can be customized
- 💾 **Auto-Save** - All product embeds are saved automatically

### 🏷️ Ticket Types Created

#### Order Tickets
- **Channel Name:** `order-[username]`
- **Access:** User, Seller, Admin
- **Function:** Purchase process and transactions

#### Customer Service Tickets
- **Channel Name:** `cs-[username]`
- **Access:** User, Support, Admin
- **Function:** Technical assistance and support

---

## 🚀 How to Use

### Main Command
```
/produk nama:[product_name] jenis:[category] harga:[product_price]
```

### Required Parameters
- **nama** - Product name (max 256 characters)
- **jenis** - Product type/category
- **harga** - Product price (example: "Rp 50.000" or "$10.99")

### Optional Parameters
- **deskripsi** - Detailed product description (max 4096 characters)
- **gambar** - Main product image URL
- **thumbnail** - Product thumbnail URL
- **warna** - Hex color code without # (example: FF6B6B)
- **channel_order** - Specific channel for order-ticket
- **channel** - Target embed channel (default: current channel)

### Basic Usage Examples

#### Simple Example
```
/produk nama:Premium Account jenis:Digital Service harga:Rp 100.000
```

#### Complete Example
```
/produk nama:Gaming Laptop jenis:Electronics harga:$899.99 deskripsi:High-performance gaming laptop with RTX 4060 gambar:https://example.com/laptop.jpg warna:FF6B6B channel_order:#order-ticket
```

---

## 🔧 Button Functionality

### 🛒 "Beli Sekarang" (Buy Now) Button
1. **If order channel specified** - Directs user to that channel
2. **If no order channel** - Automatically searches for "order-ticket" channel
3. **If not found** - Creates automatic order ticket

### 🎧 "Hubungi CS" (Contact CS) Button
- Creates automatic customer service ticket
- Channel named `cs-[username]`
- Only the concerned user and support team can access

---

## 🎨 Visual Customization

### Default Colors
- **Product:** `#FF6B6B` (pink)
- **Order Ticket:** `#FF6B6B` (pink)
- **CS Ticket:** `#3498DB` (blue)

### Image Format
- **Thumbnail:** Small image in top right corner
- **Image:** Large image below description
- **Format:** Valid URL (https://)

### Color Recommendations by Category

| Category | Hex Code | Usage Example |
|----------|----------|---------------|
| Technology | 007AFF | Blue, Discord blue (7289DA) |
| Gaming | FF6B6B | Red, Gold (FFD700) |
| Digital | 28A745 | Green, Purple (6F42C1) |
| Fashion | 495057 | Gray, Pink (E83E8C) |
| Premium | 000000 | Black, Gold (FFD700) |

---

## 🛍️ Product Examples

### 📱 Digital Products

#### Premium Discord Bot
```
/produk nama:Premium Discord Bot jenis:Digital Service harga:Rp 250.000 deskripsi:Bot Discord premium dengan fitur lengkap: Auto Moderation, Music Player, Ticket System, Custom Commands, dan 24/7 Support warna:7289DA
```

#### Game Account
```
/produk nama:Mobile Legends Epic Account jenis:Gaming Account harga:Rp 500.000 deskripsi:Account ML rank Epic dengan 50+ hero, 100+ skin rare, emblem lengkap level max. Aman dan terpercaya! gambar:https://example.com/ml-account.jpg warna:FFD700
```

#### Software License
```
/produk nama:Adobe Creative Suite License jenis:Software License harga:$29.99/month deskripsi:Lisensi resmi Adobe Creative Suite meliputi Photoshop, Illustrator, Premiere Pro, dan After Effects. 1 tahun garansi penuh. thumbnail:https://example.com/adobe-logo.png warna:FF6B35
```

### 🎮 Gaming Products

#### Steam Game
```
/produk nama:Cyberpunk 2077 jenis:PC Game harga:$59.99 deskripsi:Game RPG futuristik dengan dunia terbuka yang menakjubkan. Dapatkan key Steam original dengan bonus DLC gratis! gambar:https://example.com/cyberpunk.jpg warna:FCEE21
```

#### Gaming Chair
```
/produk nama:Gaming Chair Pro X jenis:Gaming Furniture harga:Rp 2.500.000 deskripsi:Kursi gaming premium dengan bahan kulit PU berkualitas tinggi, penyangga lumbar ergonomis, dan armrest yang dapat disesuaikan. Garansi 2 tahun! thumbnail:https://example.com/chair-thumb.jpg gambar:https://example.com/gaming-chair.jpg warna:FF4757
```

### 💻 Technology Products

#### Gaming Laptop
```
/produk nama:ASUS ROG Strix G15 jenis:Gaming Laptop harga:Rp 18.999.000 deskripsi:Laptop gaming dengan prosesor AMD Ryzen 7, GPU RTX 4060, 16GB RAM, SSD 1TB. Performa maksimal untuk gaming dan content creation! gambar:https://example.com/asus-rog.jpg warna:FF6B6B channel_order:#tech-orders
```

#### Smartphone
```
/produk nama:iPhone 15 Pro Max jenis:Smartphone harga:Rp 21.999.000 deskripsi:iPhone terbaru dengan chip A17 Pro, kamera 48MP dengan zoom 5x, layar Super Retina XDR 6.7 inch. Tersedia dalam berbagai warna! thumbnail:https://example.com/iphone-thumb.jpg warna:007AFF
```

### 🎓 Educational Products

#### Online Course
```
/produk nama:Complete Web Development Bootcamp jenis:Online Course harga:$99.99 deskripsi:Kursus lengkap web development dari basic hingga advanced. Meliputi HTML, CSS, JavaScript, React, Node.js, dan MongoDB. Sertifikat resmi included! warna:28A745
```

#### E-Book Bundle
```
/produk nama:Programming E-Book Collection jenis:Digital Book harga:Rp 150.000 deskripsi:Koleksi 50+ e-book programming dalam bahasa Indonesia: Python, JavaScript, Java, C++, dan Database. Format PDF berkualitas tinggi. thumbnail:https://example.com/ebook-thumb.jpg warna:6F42C1
```

### 🎨 Creative Products

#### Logo Design Service
```
/produk nama:Professional Logo Design jenis:Design Service harga:Rp 300.000 deskripsi:Jasa desain logo profesional untuk bisnis Anda. Meliputi 3 konsep awal, unlimited revisi, dan file dalam berbagai format (AI, PNG, JPG, SVG). warna:E83E8C
```

#### Photo Editing Service
```
/produk nama:Professional Photo Editing jenis:Photo Service harga:Rp 50.000/foto deskripsi:Layanan edit foto profesional: background removal, color correction, retouching, dan creative effects. Hasil berkualitas tinggi dalam 24 jam! gambar:https://example.com/photo-editing.jpg warna:FD7E14
```

### 🛒 Physical Products

#### Fashion Item
```
/produk nama:Oversized Hoodie Premium jenis:Fashion harga:Rp 299.000 deskripsi:Hoodie oversized premium dengan bahan cotton combed 30s. Tersedia ukuran S-XXL dalam 8 pilihan warna. Jahitan rapi dan nyaman dipakai! gambar:https://example.com/hoodie.jpg warna:495057
```

#### Gaming Accessory
```
/produk nama:Wireless Gaming Mouse jenis:Gaming Accessory harga:Rp 799.000 deskripsi:Mouse gaming wireless dengan sensor 25.000 DPI, 11 tombol programmable, RGB lighting, dan battery life hingga 70 jam. Perfect for pro gamers! thumbnail:https://example.com/mouse-thumb.jpg warna:00CED1
```

---

## 🔐 Security & Permissions

### Who Can Create Product Embeds
- ✅ **Owner** (based on OWNER_IDS)
- ✅ **Admin** (Admin role)
- ❌ Regular users

### Required Bot Permissions
- `Manage Channels` - To create tickets
- `Manage Roles` - To set ticket permissions
- `Send Messages` - To send embeds and messages
- `Read Message History` - To read chat history

---

## 💾 Data Storage

All product embeds are automatically saved with information:
- Embed message ID
- Complete product configuration
- Embed creator
- Target channel
- Creation timestamp

### Integration with Other Systems

#### With Embed System
- Product embeds stored in regular embed system
- Can be edited using `/embed edit`
- Statistics recorded in `/embed stats`

#### With Ticket System
- Order and CS tickets use same category
- Can be closed with `/ticket close`
- Data stored in ticket system

---

## 💡 Best Practices

### 🎨 Color Selection Tips
- **Technology**: `007AFF` (blue), `7289DA` (discord blue)
- **Gaming**: `FF6B6B` (red), `FFD700` (gold)
- **Digital**: `28A745` (green), `6F42C1` (purple)
- **Fashion**: `495057` (gray), `E83E8C` (pink)
- **Premium**: `000000` (black), `FFD700` (gold)

### 📝 Description Tips
- Use bullet points with emojis
- Mention main features and benefits
- Include warranty/bonus if available
- Maximum 4096 characters

### 🖼️ Image Tips
- Use reliable URLs (imgur, discord CDN)
- Thumbnail: 256x256px for optimal results
- Image: 1920x1080px or 16:9 ratio
- Format: JPG, PNG, or GIF

### 📍 Channel Management
- Set specific `channel_order` for expensive products
- Use separate channels for different categories
- Examples: `#tech-orders`, `#digital-orders`, `#physical-orders`

### 🔄 Update and Maintenance

#### Auto-Save
- Data saved every 5 minutes
- Automatic backup on bot restart
- Files stored in `data/` folder

#### Monitoring
- Use `/data info` to check storage
- Use `/embed stats` for statistics
- Logs stored in console

---

## 🆘 Troubleshooting

### Common Issues

#### Bot Not Responding to Buttons
1. Ensure bot is online and connected
2. Check bot permissions on server
3. Restart bot if necessary

#### Tickets Not Created
1. Check bot's `Manage Channels` permission
2. Ensure "Active Tickets" category exists
3. Check error logs in console

#### Embed Not Appearing
1. Check `Send Messages` permission in channel
2. Ensure image URLs are valid
3. Check parameter format

#### URL Issues
- Ensure URLs start with http:// or https://
- Test URL in browser to ensure accessibility
- Use direct image links ending with .jpg, .png, .gif

#### Character Limits
- Product name: Maximum 256 characters
- Description: Maximum 4096 characters
- Check Discord embed limits

### Advanced Troubleshooting

#### Permission Issues
- Verify bot role hierarchy
- Check channel-specific permissions
- Ensure bot has necessary server permissions

#### Data Storage Issues
- Use `/data info` to check storage usage
- Clear old data if storage is full
- Backup data regularly with `/data backup`

#### Performance Issues
- Monitor bot response time
- Check server load
- Restart bot if memory usage is high

---

## 📊 Integration Examples

### Template Management Workflow
```bash
# Create product template for recurring items
/embed save name:"laptop-template" title:"Gaming Laptop" description:"High-performance gaming laptop template"

# Use product command with custom details
/produk nama:ASUS ROG Strix G15 jenis:Gaming Laptop harga:Rp 18.999.000 channel_order:#tech-orders
```

### Data Management
```bash
# Regular backup of product data
/data backup

# Check product embed statistics
/embed stats

# Monitor storage usage
/data info
```

### Channel Organization
```bash
# Set up dedicated order channels for different categories
# #tech-orders - for technology products
# #digital-orders - for digital services
# #physical-orders - for physical items

# Example with specific order channel
/produk nama:Premium Service jenis:Digital harga:$99 channel_order:#digital-orders
```

---

## 💡 Pro Tips

### Maximizing Conversions
- Use high-quality product images
- Write compelling descriptions with benefits
- Set appropriate prices with currency
- Use contrasting colors for better visibility
- Include guarantees and bonuses in description

### Organization
- Create dedicated channels for different product types
- Use consistent naming conventions
- Regular backup of product data
- Monitor ticket creation and response times

### Customer Experience
- Respond quickly to tickets created by buttons
- Provide clear product information
- Use professional imagery
- Include contact information for support

---

**Status**: ✅ **FULLY FUNCTIONAL**

*This comprehensive guide covers all aspects of the product embed system, from basic usage to advanced customization and troubleshooting. The system is ready for production use with full integration into the bot's ecosystem!*