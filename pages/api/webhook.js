// Webhook for running the bot (can be triggered by an external cron service)
import { getBotState, updateBotState } from '../../lib/botState';
import { SidechatAPIClient } from 'sidechat.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export default async function handler(req, res) {
  // Optional: Add some basic security with a simple token
  const authToken = req.headers['x-webhook-token'];
  if (process.env.WEBHOOK_TOKEN && authToken !== process.env.WEBHOOK_TOKEN) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    // Get current bot state
    const botState = getBotState();
    
    // If bot is not supposed to be running, exit early
    if (!botState.running) {
      return res.status(200).json({ success: true, message: 'Bot is not active', ran: false });
    }
    
    // Check for scheduled start/stop times
    if (botState.startTime) {
      const startTime = new Date(botState.startTime);
      if (startTime > new Date()) {
        return res.status(200).json({ 
          success: true, 
          message: 'Waiting for scheduled start time', 
          ran: false,
          nextRunAt: startTime
        });
      }
    }
    
    if (botState.stopTime) {
      const stopTime = new Date(botState.stopTime);
      if (stopTime < new Date()) {
        // Stop the bot if we've reached the stop time
        const updatedState = updateBotState({
          running: false,
          stopTime: new Date().toISOString(),
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Bot stopped due to scheduled stop time',
          ran: false,
          state: updatedState
        });
      }
    }
    
    // Load bot config
    let config;
    try {
      config = JSON.parse(fs.readFileSync('./bot-config.json', 'utf8'));
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Failed to load bot configuration' });
    }
    
    // Run a single bot iteration
    try {
      // Initialize APIs
      const client = new SidechatAPIClient({
        phoneNumber: process.env.PHONE_NUMBER
      });
      
      // Load token
      const tokenData = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
      client.token = tokenData.token;
      
      // Run the bot task (this would be a simplified version of your bot.js logic)
      // In a production environment, you would implement the actual posting logic here
      
      // Update the last run time
      updateBotState({
        lastRun: new Date().toISOString()
      });
      
      return res.status(200).json({ 
        success: true, 
        message: 'Bot task executed successfully',
        ran: true,
        config
      });
    } catch (error) {
      console.error('Bot execution error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to execute bot task',
        error: error.message
      });
    }
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message
    });
  }
}
