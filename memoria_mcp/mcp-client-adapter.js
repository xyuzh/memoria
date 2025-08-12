#!/usr/bin/env node

/**
 * MCP Client Adapter for Firebase Memory Server
 * This adapter bridges between the local MCP client and the remote Firebase server
 */

const readline = require('readline');
const https = require('https');
const { initializeApp } = require('firebase/app');
const { getAuth, signInWithCustomToken, signInAnonymously } = require('firebase/auth');

// Configuration from environment variables
const FIREBASE_ENDPOINT = process.env.FIREBASE_ENDPOINT || 'https://us-central1-alpha-nice.cloudfunctions.net/mcpMemoryServer';
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAin2S8Y-oBvpnkRI9p9OoRFEpQ9ElUNNo';
const FIREBASE_AUTH_DOMAIN = process.env.FIREBASE_AUTH_DOMAIN || 'alpha-nice.firebaseapp.com';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'alpha-nice';
const CUSTOM_AUTH_TOKEN = process.env.CUSTOM_AUTH_TOKEN;

// Initialize Firebase if credentials are provided
let auth = null;
let authToken = null;

if (FIREBASE_API_KEY && FIREBASE_AUTH_DOMAIN) {
  const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: FIREBASE_AUTH_DOMAIN,
    projectId: FIREBASE_PROJECT_ID,
  };
  
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  // Sign in
  (async () => {
    try {
      if (CUSTOM_AUTH_TOKEN) {
        await signInWithCustomToken(auth, CUSTOM_AUTH_TOKEN);
        console.error('Authenticated with custom token');
      } else {
        await signInAnonymously(auth);
        console.error('Authenticated anonymously');
      }
      
      // Get the auth token
      const user = auth.currentUser;
      if (user) {
        authToken = await user.getIdToken();
      }
    } catch (error) {
      console.error('Authentication failed:', error.message);
    }
  })();
}

// Setup readline interface for stdio communication
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

// Buffer for incomplete JSON messages
let buffer = '';

// Process incoming messages from MCP client
rl.on('line', async (line) => {
  buffer += line;
  
  try {
    const request = JSON.parse(buffer);
    buffer = '';
    
    // Log the request for debugging
    console.error('Received request:', request.method);
    
    // Forward request to Firebase
    const response = await forwardToFirebase(request);
    
    // Send response back to MCP client
    process.stdout.write(JSON.stringify(response) + '\n');
    
  } catch (error) {
    if (error instanceof SyntaxError) {
      // Incomplete JSON, wait for more data
      return;
    }
    
    console.error('Error processing request:', error);
    
    // Send error response
    const errorResponse = {
      jsonrpc: '2.0',
      id: null,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error.message
      }
    };
    
    process.stdout.write(JSON.stringify(errorResponse) + '\n');
    buffer = '';
  }
});

// Forward request to Firebase server
async function forwardToFirebase(request) {
  return new Promise((resolve, reject) => {
    const url = new URL(FIREBASE_ENDPOINT + '/mcp');
    
    const postData = JSON.stringify(request);
    
    const options = {
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      }
    };
    
    // Add authentication header if available
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve(response);
        } catch (error) {
          console.error('Failed to parse Firebase response:', error);
          reject(error);
        }
      });
    });
    
    req.on('error', (error) => {
      console.error('Request to Firebase failed:', error);
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
}

// Handle process termination
process.on('SIGINT', () => {
  console.error('MCP Client Adapter shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('MCP Client Adapter shutting down...');
  process.exit(0);
});

// Start message
console.error('MCP Client Adapter started');
console.error(`Connecting to: ${FIREBASE_ENDPOINT}`);

// Send initialization response
const initResponse = {
  jsonrpc: '2.0',
  id: 'init',
  result: {
    protocolVersion: '1.0.0',
    capabilities: {
      tools: {},
    },
    serverInfo: {
      name: 'firebase-memory-mcp-adapter',
      version: '1.0.0',
    },
  },
};

// Wait a bit for the client to be ready
setTimeout(() => {
  process.stdout.write(JSON.stringify(initResponse) + '\n');
}, 100);