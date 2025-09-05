import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import firebaseConfig from '../lib/firebaseConfig';
import styles from './BotControl.module.css';

// Initialize Firebase on client side
let app;
let db;

// Initialize Firebase when in browser environment
if (typeof window !== 'undefined') {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
  } catch (error) {
    if (!/already exists/.test(error.message)) {
      console.error("Firebase initialization error", error);
    }
  }
}

export default function BotControl() {
  const [postType, setPostType] = useState('scarecrow');
  const [delayMin, setDelayMin] = useState(5);
  const [delayMax, setDelayMax] = useState(15);
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  // Initialize with safe default values to prevent null property access
  const [status, setStatus] = useState({ 
    running: false,
    startTime: null,
    stopTime: null,
    postType: null,
    delayRange: null,
    lastRun: null,
    updatedAt: null,
  });
  const [statusMessage, setStatusMessage] = useState('Bot is idle');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !db) {
      // Fallback to API if Firebase not available
      fetchStatus();
      return;
    }
    
    // Set up real-time listener to the bot state in Firebase
    const unsubscribe = onSnapshot(
      doc(db, "bot", "state"),
      (docSnap) => {
        if (docSnap.exists()) {
          const botState = docSnap.data();
          setStatus(botState);
          
          if (botState.running) {
            setStatusMessage(`Bot is running with post type: ${botState.postType || 'unknown'}`);
            
            // Set form values from current state
            if (botState.postType) setPostType(botState.postType);
            if (botState.delayRange) {
              setDelayMin(botState.delayRange.min);
              setDelayMax(botState.delayRange.max);
            }
          } else {
            setStatusMessage('Bot is idle');
          }
        } else {
          setStatusMessage('No bot state found');
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error getting bot state:", error);
        setStatusMessage('Error fetching bot status');
        setError(error.message);
        setLoading(false);
      }
    );
    
    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // Fallback method if Firebase is not available
  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'status' }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Status API returned ${response.status}: ${errorText}`);
        setStatusMessage('Error fetching bot status');
        return;
      }
      
      const data = await response.json();
      
      if (data.success && data.status) {
        // Ensure we have a valid status object with running property
        const safeStatus = {
          running: false,
          ...data.status
        };
        setStatus(safeStatus);
        
        if (safeStatus.running) {
          setStatusMessage(`Bot is running with post type: ${safeStatus.postType || 'unknown'}`);
        } else {
          setStatusMessage('Bot is idle');
        }
        setLoading(false);
      } else {
        console.error('Status API returned success: false or missing status', data);
        setStatusMessage('Error fetching bot status');
        // Set a safe default status
        setStatus({ running: false });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
      setStatusMessage('Error connecting to server');
      setLoading(false);
    }
  };

  const startBot = async () => {
    try {
      setStatusMessage('Starting bot...');
      
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          postType,
          delayRange: { min: delayMin, max: delayMax },
          startTime: startTime || null,
          stopTime: stopTime || null,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        setStatusMessage(`Failed to start: ${data.message}`);
      }
      // No need to setStatus here as the Firebase listener will update it
      
    } catch (error) {
      console.error('Error starting bot:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

  const stopBot = async () => {
    try {
      setStatusMessage('Stopping bot...');
      
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        setStatusMessage(`Failed to stop: ${data.message}`);
      }
      // No need to setStatus here as the Firebase listener will update it
      
    } catch (error) {
      console.error('Error stopping bot:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };
  
  // Format timestamp to readable format
  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      return 'Invalid date';
    }
  };

  if (loading) {
    return (
      <div className={styles.botControl}>
        <div className={styles.loading}>Loading bot status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.botControl}>
        <div className={styles.error}>
          Error connecting to bot: {error}
          <button 
            className={`${styles.button} ${styles.buttonPrimary}`}
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.botControl}>
      <h2 className={styles.title}>
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ marginRight: '8px', verticalAlign: 'bottom' }}
        >
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
        Bot Control
      </h2>
      
      <div className={styles.formGroup}>
        <label htmlFor="postType">Post Type</label>
        <input
          type="text"
          id="postType"
          className={styles.formControl}
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          placeholder="e.g., scarecrow, dad jokes, etc."
          disabled={status.running}
        />
      </div>
      
      <div className={styles.timeGroup}>
        <div className={styles.formGroup}>
          <label htmlFor="delayMin">Min Delay (minutes)</label>
          <input
            type="number"
            id="delayMin"
            className={styles.formControl}
            value={delayMin}
            onChange={(e) => setDelayMin(parseInt(e.target.value))}
            min="1"
            disabled={status.running}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="delayMax">Max Delay (minutes)</label>
          <input
            type="number"
            id="delayMax"
            className={styles.formControl}
            value={delayMax}
            onChange={(e) => setDelayMax(parseInt(e.target.value))}
            min={delayMin}
            disabled={status.running}
          />
        </div>
      </div>
      
      <div className={styles.timeGroup}>
        <div className={styles.formGroup}>
          <label htmlFor="startTime">Start Time (optional)</label>
          <input
            type="datetime-local"
            id="startTime"
            className={styles.formControl}
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={status.running}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="stopTime">Stop Time (optional)</label>
          <input
            type="datetime-local"
            id="stopTime"
            className={styles.formControl}
            value={stopTime}
            onChange={(e) => setStopTime(e.target.value)}
            disabled={status.running}
          />
        </div>
      </div>
      
      <div className={styles.buttonGroup}>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={startBot}
          disabled={status.running}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}
          >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Start Bot
        </button>
        
        <button
          className={`${styles.button} ${styles.buttonDanger}`}
          onClick={stopBot}
          disabled={!status.running}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{ marginRight: '8px', verticalAlign: 'text-bottom' }}
          >
            <rect x="6" y="6" width="12" height="12"></rect>
          </svg>
          Stop Bot
        </button>
      </div>
      
      <div className={`${styles.status} ${status && status.running ? styles.running : (statusMessage && statusMessage.includes('stopped') ? styles.stopped : styles.idle)}`}>
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ marginRight: '10px', verticalAlign: 'text-bottom' }}
        >
          {status && status.running ? 
            <><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></> : 
            <><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></>
          }
        </svg>
        {statusMessage || 'Loading status...'}
      </div>
      
      {status && (
        <div className={styles.botDetails}>
          <div className={styles.detailItem}>
            <strong>Last Updated:</strong> {formatTime(status.updatedAt)}
          </div>
          {status.lastRun && (
            <div className={styles.detailItem}>
              <strong>Last Run:</strong> {formatTime(status.lastRun)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
