// Next.js API route handler for bot control
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Track the current bot process
let botProcess = null;
let botStatus = {
  running: false,
  startTime: null,
  stopTime: null,
  postType: null,
  delayRange: null,
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, postType, delayRange, startTime, stopTime } = req.body;
      
      if (action === 'start') {
        if (botProcess) {
          return res.status(400).json({ success: false, message: 'Bot is already running' });
        }

        // Create a temporary config file for the bot
        const config = {
          postType: postType || 'scarecrow', // Default to scarecrow if not specified
          delayMin: delayRange?.min || 5,
          delayMax: delayRange?.max || 15,
          startTime: startTime || null,
          stopTime: stopTime || null,
        };

        fs.writeFileSync(
          path.join(process.cwd(), 'bot-config.json'),
          JSON.stringify(config, null, 2)
        );

        // Start the bot process
        botProcess = exec('node bot.js', (error) => {
          if (error) {
            console.error(`Bot process error: ${error.message}`);
            botProcess = null;
            botStatus.running = false;
          }
        });

        botStatus = {
          running: true,
          startTime: new Date().toISOString(),
          stopTime: stopTime || null,
          postType,
          delayRange,
        };

        return res.status(200).json({ success: true, message: 'Bot started', status: botStatus });
      } 
      else if (action === 'stop') {
        if (!botProcess) {
          return res.status(400).json({ success: false, message: 'Bot is not running' });
        }

        // Kill the bot process
        if (process.platform === 'win32') {
          exec(`taskkill /pid ${botProcess.pid} /f`);
        } else {
          botProcess.kill('SIGINT');
        }

        botProcess = null;
        botStatus = {
          running: false,
          startTime: null,
          stopTime: new Date().toISOString(),
          postType: null,
          delayRange: null,
        };

        return res.status(200).json({ success: true, message: 'Bot stopped', status: botStatus });
      }
      else if (action === 'status') {
        return res.status(200).json({ success: true, status: botStatus });
      }
      else {
        return res.status(400).json({ success: false, message: 'Invalid action' });
      }
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
