// Next.js API route handler for bot control
import { getBotState, updateBotState, createBotConfig } from '../../lib/firebaseDB';

export default async function handler(req, res) {
  console.log('API route /api/bot called with method:', req.method);
  
  if (req.method === 'POST') {
    try {
      const { action, postType, delayRange, startTime, stopTime } = req.body;
      console.log('Request body:', { action, postType, delayRange, startTime, stopTime });
      
      console.log('Getting bot state from Firebase...');
      const currentState = await getBotState();
      console.log('Current bot state:', currentState);
      
      if (action === 'start') {
        console.log('Starting bot...');
        if (currentState.running) {
          console.log('Bot is already running, returning 400');
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
        
        console.log('Creating bot config:', config);
        
        try {
          // Save config to Firebase
          await createBotConfig(config);
          console.log('Bot config saved to Firebase');
          
          // Update bot state in Firebase
          console.log('Updating bot state in Firebase...');
          const updatedState = await updateBotState({
            running: true,
            startTime: new Date().toISOString(),
            stopTime: stopTime || null,
            postType,
            delayRange,
            lastRun: new Date().toISOString(),
          });
          console.log('Bot state updated:', updatedState);
          
          return res.status(200).json({ success: true, message: 'Bot started', status: updatedState });
        } catch (dbError) {
          console.error('Firebase operation failed:', dbError);
          return res.status(500).json({ 
            success: false, 
            message: 'Database operation failed', 
            error: dbError.message 
          });
        }
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
