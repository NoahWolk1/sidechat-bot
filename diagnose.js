#!/usr/bin/env node

/**
 * Sidechat Bot Diagnostic Tool
 * 
 * Run this script to check if your bot deployment is working correctly.
 * Usage: node diagnose.js <your-app-url> <debug-token>
 */

const https = require('https');
const http = require('http');
const url = require('url');

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

// Helper function for HTTP requests
function makeRequest(requestUrl, options = {}) {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(requestUrl);
    const httpModule = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = httpModule.request(requestUrl, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const jsonData = JSON.parse(data);
            resolve({ statusCode: res.statusCode, data: jsonData });
          } catch (e) {
            resolve({ statusCode: res.statusCode, data });
          }
        } else {
          reject({ statusCode: res.statusCode, data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Log with formatting
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Print section header
function section(title) {
  console.log('\n' + colors.bold + colors.cyan + '▶ ' + title + colors.reset);
  console.log('  ' + '─'.repeat(title.length + 2));
}

// Run the diagnostic
async function runDiagnostic(baseUrl, debugToken) {
  log('Sidechat Bot Diagnostic', 'bold');
  log('======================', 'bold');
  log(`Testing deployment at: ${baseUrl}\n`);

  try {
    // 1. Check if the app is reachable
    section('Testing Website Availability');
    try {
      await makeRequest(baseUrl);
      log('✓ Website is reachable', 'green');
    } catch (error) {
      log('✗ Cannot reach website', 'red');
      log(`Error: ${error.message}`, 'red');
      return;
    }

    // 2. Check debug endpoint
    section('Testing Debug Endpoint');
    try {
      const debugResult = await makeRequest(`${baseUrl}/api/debug`, {
        headers: {
          'x-debug-token': debugToken
        }
      });
      
      log('✓ Debug endpoint responded', 'green');
      
      // Check environment variables
      const envVars = debugResult.data.environmentVariables;
      log('\nEnvironment Variables:');
      for (const [key, value] of Object.entries(envVars)) {
        const color = value ? 'green' : 'red';
        const symbol = value ? '✓' : '✗';
        log(`  ${symbol} ${key}: ${value}`, color);
      }
      
      // Check Firebase connection
      const firebase = debugResult.data.firebase;
      log('\nFirebase Connection:');
      if (firebase.connection === 'success') {
        log('  ✓ Connected to Firebase successfully', 'green');
        log(`  ✓ Bot state document exists: ${firebase.stateDocExists}`, 'green');
        
        if (firebase.botState) {
          log('\nBot State:');
          log(`  • Running: ${firebase.botState.running}`, firebase.botState.running ? 'green' : 'yellow');
          log(`  • Post Type: ${firebase.botState.postType || 'not set'}`);
          log(`  • Last Updated: ${firebase.botState.lastUpdated || 'never'}`);
          log(`  • Last Run: ${firebase.botState.lastRun || 'never'}`);
        }
      } else {
        log('  ✗ Failed to connect to Firebase', 'red');
        log(`  Error: ${firebase.error?.message || 'Unknown error'}`, 'red');
      }
      
    } catch (error) {
      log('✗ Debug endpoint error', 'red');
      log(`Error: ${JSON.stringify(error)}`, 'red');
    }

    // 3. Test bot status API
    section('Testing Bot Status API');
    try {
      const statusResult = await makeRequest(`${baseUrl}/api/bot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: { action: 'status' }
      });
      
      log('✓ Status API responded', 'green');
      
      if (statusResult.data.success) {
        const botStatus = statusResult.data.status;
        log('\nCurrent Bot Status:');
        log(`  • Running: ${botStatus.running}`, botStatus.running ? 'green' : 'yellow');
        log(`  • Post Type: ${botStatus.postType || 'not set'}`);
        
        if (botStatus.delayRange) {
          log(`  • Delay Range: ${botStatus.delayRange.min}-${botStatus.delayRange.max} minutes`);
        }
        
        if (botStatus.lastRun) {
          log(`  • Last Run: ${new Date(botStatus.lastRun).toLocaleString()}`);
        }
        
        if (botStatus.error) {
          log(`  ✗ Error: ${botStatus.error}`, 'red');
        }
      } else {
        log(`✗ Status API returned error: ${statusResult.data.message}`, 'red');
      }
    } catch (error) {
      log('✗ Status API error', 'red');
      log(`Error: ${JSON.stringify(error)}`, 'red');
    }

    // 4. Print summary and recommendations
    section('Diagnostic Summary');
    
    log('Based on the diagnostic results, check the following:', 'cyan');
    log('1. Ensure all environment variables are set correctly in Vercel', 'cyan');
    log('2. Check that Firebase is properly configured and accessible', 'cyan');
    log('3. Verify the cron job is configured correctly in vercel.json', 'cyan');
    log('4. Review the Function Logs in Vercel dashboard for detailed errors', 'cyan');
    
  } catch (error) {
    log('An unexpected error occurred during diagnostics', 'red');
    log(error.stack, 'red');
  }
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    log('Usage: node diagnose.js <your-app-url> <debug-token>', 'yellow');
    log('Example: node diagnose.js https://your-app.vercel.app abc123', 'yellow');
    process.exit(1);
  }
  
  const baseUrl = args[0];
  const debugToken = args[1];
  
  runDiagnostic(baseUrl, debugToken).catch(error => {
    log('Fatal error:', 'red');
    log(error, 'red');
  });
}

main();
