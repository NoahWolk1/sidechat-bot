// Webhook for running the bot (can be triggered by an external cron service or Vercel Cron)
import { getBotState, updateBotState, getBotConfig, logBotActivity } from '../../lib/firebaseDB';
import { SidechatAPIClient } from 'sidechat.js';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

export default async function handler(req, res) {
  console.log('Webhook triggered at:', new Date().toISOString());
  
  // Optional: Add some basic security with a simple token
  const authToken = req.headers['x-webhook-token'];
  console.log('Authentication check:', { 
    hasWebhookToken: !!process.env.WEBHOOK_TOKEN,
    authTokenProvided: !!authToken,
    tokenMatch: authToken === process.env.WEBHOOK_TOKEN 
  });
  
  if (process.env.WEBHOOK_TOKEN && authToken !== process.env.WEBHOOK_TOKEN) {
    console.log('Unauthorized webhook access attempt');
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  
  try {
    console.log('Getting bot state from Firebase...');
    // Get current bot state from Firebase
    const botState = await getBotState();
    console.log('Bot state retrieved:', botState);
    
    // If bot is not supposed to be running, exit early
    if (!botState.running) {
      console.log('Bot is not active, exiting webhook');
      return res.status(200).json({ success: true, message: 'Bot is not active', ran: false });
    }
    
    // Check for scheduled start/stop times
    if (botState.startTime) {
      const startTime = new Date(botState.startTime);
      if (startTime > new Date()) {
        await logBotActivity({
          type: 'waiting_for_start',
          message: 'Waiting for scheduled start time',
          nextRunAt: startTime
        });
        
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
        const updatedState = await updateBotState({
          running: false,
          stopTime: new Date().toISOString(),
        });
        
        await logBotActivity({
          type: 'auto_stopped',
          message: 'Bot stopped due to scheduled stop time',
          stopTime: new Date().toISOString()
        });
        
        return res.status(200).json({ 
          success: true, 
          message: 'Bot stopped due to scheduled stop time',
          ran: false,
          state: updatedState
        });
      }
    }
    
    // Load bot config from Firebase
    const config = await getBotConfig();
    if (!config) {
      return res.status(500).json({ success: false, message: 'Failed to load bot configuration' });
    }
    
    // Run a single bot iteration
    try {
      // Initialize APIs
      const client = new SidechatAPIClient({
        phoneNumber: process.env.PHONE_NUMBER
      });
      
      // Load token - in production environment, this should be stored securely
      // Either in Firebase or as an environment variable
      let tokenData;
      try {
        // First try to read from file if available (local dev environment)
        tokenData = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
      } catch (error) {
        // If file doesn't exist, try to use environment variable
        if (process.env.SIDECHAT_TOKEN) {
          tokenData = { token: process.env.SIDECHAT_TOKEN };
        } else {
          throw new Error('No Sidechat token available');
        }
      }
      
      client.token = tokenData.token;
      
      // Run the bot task - this would execute the actual posting logic
      // This is a simplified version that logs activity but doesn't actually post
      // In production, implement your full posting logic here
      
      await logBotActivity({
        type: 'task_executed',
        message: `Bot executed with post type: ${config.postType}`,
        postType: config.postType,
        delayMin: config.delayMin,
        delayMax: config.delayMax
      });
      
      // Update the last run time
      await updateBotState({
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
