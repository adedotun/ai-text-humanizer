#!/usr/bin/env node

/**
 * Test script for AI Text Humanizer API
 * Tests all endpoints with sample text
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5001';
const TEST_TEXT = `Furthermore, it is important to note that artificial intelligence has revolutionized numerous industries. Additionally, machine learning algorithms facilitate data processing. In conclusion, these technologies demonstrate significant potential.`;

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(name, endpoint, data) {
  try {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Testing: ${name}`, 'blue');
    log(`${'='.repeat(60)}`, 'cyan');
    
    const response = await axios.post(`${API_URL}${endpoint}`, data);
    
    log(`✓ Success!`, 'green');
    console.log(JSON.stringify(response.data, null, 2));
    
    return response.data;
  } catch (error) {
    log(`✗ Error: ${error.message}`, 'red');
    if (error.response) {
      console.log('Response:', error.response.data);
    }
    return null;
  }
}

async function runTests() {
  log('\n🤖 AI Text Humanizer API Test Suite', 'cyan');
  log(`Testing against: ${API_URL}\n`, 'yellow');
  
  // Test 1: AI Detection
  await testEndpoint(
    'AI Detection',
    '/api/detect-ai',
    { text: TEST_TEXT }
  );
  
  // Test 2: Humanization (Low Intensity)
  await testEndpoint(
    'Humanization - Low Intensity',
    '/api/humanize',
    { text: TEST_TEXT, intensity: 'low' }
  );
  
  // Test 3: Humanization (Medium Intensity)
  await testEndpoint(
    'Humanization - Medium Intensity',
    '/api/humanize',
    { text: TEST_TEXT, intensity: 'medium' }
  );
  
  // Test 4: Humanization (High Intensity)
  await testEndpoint(
    'Humanization - High Intensity',
    '/api/humanize',
    { text: TEST_TEXT, intensity: 'high' }
  );
  
  // Test 5: Full Process
  await testEndpoint(
    'Full Process (Detect + Humanize)',
    '/api/process',
    { text: TEST_TEXT, intensity: 'medium', forceHumanize: true }
  );
  
  log(`\n${'='.repeat(60)}`, 'cyan');
  log('✓ All tests completed!', 'green');
  log(`${'='.repeat(60)}\n`, 'cyan');
  
  // Check if Hugging Face API is configured
  log('\n📝 Note:', 'yellow');
  log('If you see "Hugging Face API error" in server logs,', 'yellow');
  log('the app is using fallback custom humanization logic.', 'yellow');
  log('To use Hugging Face API (better results), add HUGGINGFACE_API_KEY to server/.env', 'yellow');
  log('Get your free token at: https://huggingface.co/settings/tokens\n', 'yellow');
}

// Run tests
runTests().catch(console.error);

