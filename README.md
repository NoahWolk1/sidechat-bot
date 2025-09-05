# Sidechat Bot Controller

This is a web application to control a Sidechat posting bot. It provides a UI for configuring and managing the bot.

## Local Development

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

## Deployment to Vercel

This project is designed to be deployed on Vercel. Follow these steps:

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Configure the following environment variables in Vercel:
   - `PHONE_NUMBER` - Your Sidechat phone number
   - `GROUP_ID` - The Sidechat group ID 
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `WEBHOOK_TOKEN` - A secure random token for the webhook API

## Important Notes for Serverless Deployment

Since Vercel uses a serverless architecture, the bot cannot run continuously in the background like it would on a traditional server. Instead, we use a state management approach:

1. The UI controls update a state file that tracks the desired bot configuration
2. A webhook endpoint `/api/webhook` can be called by an external service (like cron-job.org) to run the bot tasks periodically
3. The webhook checks the state to determine if the bot should be active

## Setting Up the Webhook

To run the bot in production:

1. Register on a service like [cron-job.org](https://cron-job.org/)
2. Create a new cron job that calls `https://your-vercel-app.vercel.app/api/webhook`
3. Set the frequency to every few minutes (e.g., every 5-15 minutes)
4. Add the header `x-webhook-token` with the value of your `WEBHOOK_TOKEN` environment variable

This ensures the bot will run periodically while maintaining the configuration you set through the UI.
