# Discord Bot Deployment Guide

## Deployment Options

Your Discord bot is designed as a **long-running Node.js application** that maintains a persistent connection to Discord's WebSocket gateway. This architecture is **NOT compatible with Vercel** (which is designed for serverless functions), but works perfectly with these platforms:

## ✅ Recommended Platforms

### 1. Railway (Recommended)
**Why Railway?**
- Perfect for Discord bots
- Simple deployment process
- Built-in environment variable management
- Automatic deployments from Git
- Free tier available

**Deployment Steps:**
1. Go to [railway.app](https://railway.app)
2. Sign up/login with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your Discord bot repository
5. Set environment variables:
   - `DISCORD_TOKEN`: Your bot token
   - `GUILD_ID`: Your server ID
   - `CLIENT_ID`: Your application ID
   - Other optional role configurations
6. Deploy automatically starts!

### 2. Render
**Why Render?**
- Free tier for small projects
- Easy GitHub integration
- Environment variable support
- Simple setup process

**Deployment Steps:**
1. Go to [render.com](https://render.com)
2. Sign up/login with GitHub
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Build Command: `npm install`
   - Start Command: `npm start`
6. Add environment variables in dashboard
7. Deploy!

### 3. Heroku
**Classic choice for Node.js apps**
1. Install Heroku CLI
2. `heroku create your-bot-name`
3. `heroku config:set DISCORD_TOKEN=your_token`
4. `heroku config:set GUILD_ID=your_guild_id`
5. `git push heroku main`

### 4. DigitalOcean App Platform
**More advanced option**
- Good for production applications
- Scalable infrastructure
- Easy deployment from GitHub

## 📁 Deployment Files Created

Your project now includes these deployment configuration files:

### `Procfile`
```
web: node main.js
```
Tells platforms like Heroku how to start your application.

### `railway.json`
```json
{
  "engines": {
    "node": ">=18.0.0"
  },
  "nixpacks": {
    "app": "main.js"
  }
}
```
Railway-specific configuration.

### Updated `package.json`
- Added Node.js engine requirements
- Added build command for deployment platforms

## 🔧 Environment Variables Required

Make sure to set these on your deployment platform:

**Required:**
- `DISCORD_TOKEN` - Your Discord bot token
- `GUILD_ID` - Your Discord server ID

**Optional (with defaults):**
- `CLIENT_ID` - Your Discord application ID
- `OWNER_IDS` - Owner user IDs (comma-separated)
- `ADMIN_ROLE` - Admin role name (default: "Admin")
- `SELLER_ROLE` - Seller role name (default: "Seller")
- `BUYER_ROLE` - Buyer role name (default: "Buyer")
- `SUPPORT_ROLE` - Support role name (default: "Support")

## 🚫 Why Vercel Won't Work

Your bot uses:
```javascript
// Persistent WebSocket connection
client.login(config.bot.token)

// Event listeners that need to stay active
client.on(Events.InteractionCreate, handleInteraction)
```

Vercel is designed for:
- Serverless functions that respond to HTTP requests
- Functions that start, process, and terminate quickly
- Stateless applications

To use Vercel, you'd need to completely rewrite the bot to use Discord's webhook system instead of WebSocket connections.

## 🚀 Quick Deployment with Railway

1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push
   ```

2. **Deploy on Railway**:
   - Go to railway.app
   - Connect GitHub account
   - Select your repository
   - Add environment variables
   - Deploy!

3. **Monitor Logs**:
   - Check Railway dashboard for deployment logs
   - Look for "Logged in as [BotName]" message
   - Verify "Bot initialization completed successfully"

## 📝 Post-Deployment Checklist

- [ ] Bot appears online in Discord
- [ ] Slash commands are working
- [ ] Environment variables are set correctly
- [ ] Bot has proper permissions in your server
- [ ] Test ticket creation and management
- [ ] Verify product embed functionality
- [ ] Check data persistence (tickets, embeds, etc.)

## 🆘 Troubleshooting

**Bot not starting:**
- Check environment variables are set correctly
- Verify Discord token is valid
- Ensure Guild ID matches your server

**Commands not working:**
- Check bot permissions in Discord server
- Verify bot has "Use Slash Commands" permission
- Check if commands are registered (should happen automatically)

**Data not persisting:**
- Railway/Render provide persistent file storage
- Check logs for any storage errors
- Verify data directory is being created

## 📚 Additional Resources

- [Railway Discord Bot Guide](https://docs.railway.app/deploy/discord-bot)
- [Render Discord Bot Tutorial](https://render.com/docs/deploy-discord-bot)
- [Discord.js Deployment Guide](https://discordjs.guide/additional-info/readme-deployment.html)