// Next.js API route handler for bot control
import { getBotState, updateBotState, createBotConfig } from '../../lib/firebaseDB';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { action, postType, delayRange, startTime, stopTime } = req.body;
      const currentState = await getBotState();
      
      if (action === 'start') {
        if (currentState.running) {
          return res.status(400).json({ success: false, message: 'Bot is already running' });
        }

        // Create a configuration file for the bot
        const config = {
          postType: postType || 'scarecrow', // Default to scarecrow if not specified
          delayMin: delayRange?.min || 5,
          delayMax: delayRange?.max || 15,
          startTime: startTime || null,
          stopTime: stopTime || null,
        };

        // Save config to Firebase
        await createBotConfig(config);

        // Update bot state in Firebase
        const updatedState = await updateBotState({
          running: true,
          startTime: new Date().toISOString(),
          stopTime: stopTime || null,
          postType,
          delayRange,
          lastRun: new Date().toISOString(),
        });

        return res.status(200).json({ success: true, message: 'Bot started', status: updatedState });
      } 
      else if (action === 'stop') {
        if (!currentState.running) {
          return res.status(400).json({ success: false, message: 'Bot is not running' });
        }

        // Update bot state in Firebase
        const updatedState = await updateBotState({
          running: false,
          stopTime: new Date().toISOString(),
          postType: currentState.postType, // Keep the post type for history
          delayRange: currentState.delayRange, // Keep the delay range for history
        });

        return res.status(200).json({ success: true, message: 'Bot stopped', status: updatedState });
      }
      else if (action === 'status') {
        // Make sure we return a valid status object
        const safeState = currentState || {
          running: false,
          startTime: null,
          stopTime: null,
          postType: null,
          delayRange: null,
          lastRun: null,
          updatedAt: new Date().toISOString()
        };
        return res.status(200).json({ success: true, status: safeState });
      }
      else {
        return res.status(400).json({ success: false, message: 'Invalid action' });
      }
    } catch (error) {
      console.error('API error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Server error', 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }
}
