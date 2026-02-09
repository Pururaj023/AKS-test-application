#!/usr/bin/env node

/**
 * Test script to demonstrate various logging scenarios
 * Run this after starting the server with: node test.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Sleep helper
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runTests() {
  console.log('🚀 Starting API Logging Tests...\n');

  try {
    // Test 1: Successful request
    console.log('📝 Test 1: GET /api/v1/product/recently-viewed');
    const test1 = await makeRequest('GET', '/api/v1/product/recently-viewed', null, {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36',
      'x-customer-no': 'LWD00198125'
    });
    console.log(`✅ Status: ${test1.status}`);
    console.log(`   Response: ${JSON.stringify(test1.body)}\n`);
    await sleep(500);

    // Test 2: Get product details
    console.log('📝 Test 2: GET /api/v1/product/123');
    const test2 = await makeRequest('GET', '/api/v1/product/123', null, {
      'x-customer-no': 'LWD00198125'
    });
    console.log(`✅ Status: ${test2.status}`);
    console.log(`   Response: ${JSON.stringify(test2.body)}\n`);
    await sleep(500);

    // Test 3: Error scenario
    console.log('📝 Test 3: GET /api/v1/product/error-demo (Should trigger error)');
    const test3 = await makeRequest('GET', '/api/v1/product/error-demo', null, {
      'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      'x-customer-no': 'LWD00198125'
    });
    console.log(`❌ Status: ${test3.status}`);
    console.log(`   Error Response: ${JSON.stringify(test3.body)}\n`);
    await sleep(500);

    // Test 4: Create order success
    console.log('📝 Test 4: POST /api/v1/order/create');
    const test4 = await makeRequest('POST', '/api/v1/order/create', {
      items: [{ id: 1, qty: 2 }, { id: 2, qty: 1 }],
      totalAmount: 299.97
    }, {
      'x-customer-no': 'LWD00198125'
    });
    console.log(`✅ Status: ${test4.status}`);
    console.log(`   Response: ${JSON.stringify(test4.body)}\n`);
    await sleep(500);

    // Test 5: Invalid payment
    console.log('📝 Test 5: POST /api/v1/payment/validate (Invalid data)');
    const test5 = await makeRequest('POST', '/api/v1/payment/validate', {
      paymentMethod: '',
      amount: 0
    }, {
      'x-customer-no': 'LWD00198125'
    });
    console.log(`❌ Status: ${test5.status}`);
    console.log(`   Error Response: ${JSON.stringify(test5.body)}\n`);
    await sleep(500);

    // Test 6: Valid payment
    console.log('📝 Test 6: POST /api/v1/payment/validate (Valid data)');
    const test6 = await makeRequest('POST', '/api/v1/payment/validate', {
      paymentMethod: 'credit_card',
      amount: 150.00
    }, {
      'x-customer-no': 'LWD00198125'
    });
    console.log(`✅ Status: ${test6.status}`);
    console.log(`   Response: ${JSON.stringify(test6.body)}\n`);
    await sleep(500);

    // Test 7: 404 error
    console.log('📝 Test 7: GET /api/v1/nonexistent (404 error)');
    const test7 = await makeRequest('GET', '/api/v1/nonexistent', null, {
      'x-customer-no': 'LWD00198125'
    });
    console.log(`❌ Status: ${test7.status}`);
    console.log(`   Error Response: ${JSON.stringify(test7.body)}\n`);

    console.log('✨ All tests completed!');
    console.log('📋 Check the console output and ./logs/combined.log for detailed logs');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Make sure the server is running on port 3000');
  }
}

// Run tests
runTests();