import { useState, useEffect } from 'react';

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
      
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.status);
        if (data.status.running) {
          setStatusMessage(`Bot is running with post type: ${data.status.postType}`);
        } else {
          setStatusMessage('Bot is idle');
        }
      }
    } catch (error) {
      console.error('Error fetching bot status:', error);
    }
  };

  const startBot = async () => {
    try {
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
      const response = await fetch('/api/bot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'stop' }),
      });
      
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
    <div className="card">
      <h2>Bot Control Panel</h2>
      
      <div className="form-group">
        <label htmlFor="postType">Post Type</label>
        <input
          type="text"
          id="postType"
          className="form-control"
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          placeholder="e.g., scarecrow, dad jokes, etc."
          disabled={status.running}
        />
      </div>
      
      <div className="time-group">
        <div className="form-group">
          <label htmlFor="delayMin">Min Delay (minutes)</label>
          <input
            type="number"
            id="delayMin"
            className="form-control"
            value={delayMin}
            onChange={(e) => setDelayMin(parseInt(e.target.value))}
            min="1"
            disabled={status.running}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="delayMax">Max Delay (minutes)</label>
          <input
            type="number"
            id="delayMax"
            className="form-control"
            value={delayMax}
            onChange={(e) => setDelayMax(parseInt(e.target.value))}
            min={delayMin}
            disabled={status.running}
          />
        </div>
      </div>
      
      <div className="time-group">
        <div className="form-group">
          <label htmlFor="startTime">Start Time (optional)</label>
          <input
            type="datetime-local"
            id="startTime"
            className="form-control"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            disabled={status.running}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="stopTime">Stop Time (optional)</label>
          <input
            type="datetime-local"
            id="stopTime"
            className="form-control"
            value={stopTime}
            onChange={(e) => setStopTime(e.target.value)}
            disabled={status.running}
          />
        </div>
      </div>
      
      <div className="button-group">
        <button
          className="button button-primary"
          onClick={startBot}
          disabled={status.running}
        >
          Start Bot
        </button>
        
        <button
          className="button button-danger"
          onClick={stopBot}
          disabled={!status.running}
        >
          Stop Bot
        </button>
      </div>
      
      <div className={`status ${status.running ? 'running' : 'idle'}`}>
        {statusMessage}
      </div>
    </div>
  );
}
