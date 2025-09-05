// Firebase utilities for interacting with the database
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';

// Initialize Firebase
let app;
let db;

try {
  // Check if Firebase is already initialized
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error("Firebase initialization error", error.stack);
  }
}

// Default bot state
const defaultBotState = {
  running: false,
  startTime: null,
  stopTime: null,
  postType: 'scarecrow',
  delayRange: {
    min: 5,
    max: 15
  },
  lastRun: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};

// Get bot state from Firestore
export async function getBotState() {
  try {
    const docRef = doc(db, "bot", "state");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // If document doesn't exist, create it with default values
      const newState = { ...defaultBotState };
      await setDoc(docRef, newState);
      return newState;
    }
  } catch (error) {
    console.error("Error getting bot state:", error);
    return { ...defaultBotState };
  }
}

// Update bot state in Firestore
export async function updateBotState(newState) {
  try {
    const docRef = doc(db, "bot", "state");
    // Get current state first
    const currentState = await getBotState();
    
    // Merge with new state and add timestamp
    const updatedState = {
      ...currentState,
      ...newState,
      updatedAt: new Date().toISOString()
    };
    
    await updateDoc(docRef, updatedState);
    return updatedState;
  } catch (error) {
    console.error("Error updating bot state:", error);
    // Always return a valid state object
    return { ...defaultBotState, ...newState };
  }
}

// Create a configuration file for the bot
export async function createBotConfig(config) {
  try {
    const docRef = doc(db, "bot", "config");
    await setDoc(docRef, {
      ...config,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error("Error creating bot config:", error);
    return false;
  }
}

// Get bot configuration from Firestore
export async function getBotConfig() {
  try {
    const docRef = doc(db, "bot", "config");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting bot config:", error);
    return null;
  }
}

// Log bot activity to Firestore
export async function logBotActivity(activity) {
  try {
    const timestamp = new Date().toISOString();
    const docRef = doc(db, "bot", "logs", timestamp);
    await setDoc(docRef, {
      ...activity,
      timestamp
    });
    return true;
  } catch (error) {
    console.error("Error logging bot activity:", error);
    return false;
  }
}
