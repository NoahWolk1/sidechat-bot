// Utility for managing bot state in a serverless environment
import fs from 'fs';
import path from 'path';

const STATE_FILE = path.join(process.cwd(), 'bot-state.json');

// Default state
const defaultState = {
  running: false,
  startTime: null,
  stopTime: null,
  postType: null,
  delayRange: null,
  lastRun: null,
};

// Get the current bot state
export function getBotState() {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      return state;
    }
  } catch (error) {
    console.error('Error reading state file:', error);
  }
  
  return { ...defaultState };
}

// Update the bot state
export function updateBotState(newState) {
  try {
    const currentState = getBotState();
    const updatedState = { ...currentState, ...newState };
    
    fs.writeFileSync(STATE_FILE, JSON.stringify(updatedState, null, 2));
    return updatedState;
  } catch (error) {
    console.error('Error updating state file:', error);
    return null;
  }
}

// Create a configuration file for the bot
export function createBotConfig(config) {
  try {
    fs.writeFileSync(
      path.join(process.cwd(), 'bot-config.json'),
      JSON.stringify(config, null, 2)
    );
    return true;
  } catch (error) {
    console.error('Error creating bot config:', error);
    return false;
  }
}
