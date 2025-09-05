# Standalone Sidechat Bot
This is a standalone version of the Sidechat bot that can run continuously on a server.

## Setup
1. Clone this repository
2. Install dependencies: `npm install`
3. Create a `.env` file with your credentials (see below)
4. Start the bot: `node standalone-bot.js`

## Environment Variables
```
PHONE_NUMBER=your_phone_number
GROUP_ID=your_group_id
GEMINI_API_KEY=your_gemini_api_key
```

## Running on a Server
For 24/7 operation, deploy this bot on a cloud service like:
- Heroku
- DigitalOcean
- AWS EC2
- Railway
- Fly.io

## Using PM2 (Process Manager)
For more robust operation:
```bash
# Install PM2
npm install -g pm2

# Start the bot with PM2
pm2 start standalone-bot.js

# Make sure it starts after server reboot
pm2 startup
pm2 save
```
