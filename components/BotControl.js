import { useState, useEffect } from 'react';
import styles from './BotControl.module.css';

export default function BotControl() {
  const [postType, setPostType] = useState('scarecrow');
  const [delayMin, setDelayMin] = useState(5);
  const [delayMax, setDelayMax] = useState(15);
  const [startTime, setStartTime] = useState('');
  const [stopTime, setStopTime] = useState('');
  const [status, setStatus] = useState({ running: false });
  const [statusMessage, setStatusMessage] = useState('Bot is idle');

  useEffect(() => {
    // Check bot status on component mount
    fetchStatus();
  }, []);

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
      
      if (data.success) {
        setStatus(data.status);
        if (data.status.running) {
          setStatusMessage(`Bot is running with post type: ${data.status.postType}`);
        } else {
          setStatusMessage('Bot is idle');
        }
      } else {
        console.error('Status API returned success: false', data);
        setStatusMessage('Error fetching bot status');
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
      setStatusMessage('Error connecting to server');
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
      
      if (data.success) {
        setStatus(data.status);
        setStatusMessage(`Bot started with post type: ${postType}`);
      } else {
        setStatusMessage(`Failed to start: ${data.message}`);
      }
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
      
      if (data.success) {
        setStatus(data.status);
        setStatusMessage('Bot has been stopped');
      } else {
        setStatusMessage(`Failed to stop: ${data.message}`);
      }
    } catch (error) {
      console.error('Error stopping bot:', error);
      setStatusMessage(`Error: ${error.message}`);
    }
  };

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
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="9" x2="9" y2="15"></line>
          <line x1="15" y1="9" x2="15" y2="15"></line>
        </svg>
        Bot Control Panel
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
      
      <div className={`${styles.status} ${status.running ? styles.running : (statusMessage.includes('stopped') ? styles.stopped : styles.idle)}`}>
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
          {status.running ? 
            <><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></> : 
            <><circle cx="12" cy="12" r="10"></circle><path d="M12 8v4l3 3"></path></>
          }
        </svg>
        {statusMessage}
      </div>
    </div>
  );
}
