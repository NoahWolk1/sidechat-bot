'use strict';

// This is a simple wrapper to maintain backward compatibility
// It allows running the bot directly with `node main.js`
const { runBot } = require('./bot.js');

// Run the bot when this script is executed directly
runBot();
