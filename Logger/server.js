const express = require('express');
const bodyParser = require('body-parser');
const { requestLogger, errorLogger } = require('./middleware');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Trust proxy to get correct IP
app.set('trust proxy', true);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Apply request logging middleware (after static files to avoid logging static assets)
app.use(requestLogger);

// Sample routes

// Recently viewed products endpoint (matching the image)
app.get('/api/v1/product/recently-viewed', (req, res) => {
  res.json({
    success: true,
    data: [
      { id: 1, name: 'Product 1', lastViewed: new Date() },
      { id: 2, name: 'Product 2', lastViewed: new Date() }
    ]
  });
});

// Product details
app.get('/api/v1/product/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    success: true,
    data: {
      id: id,
      name: `Product ${id}`,
      price: 99.99,
      description: 'Sample product description'
    }
  });
});

// User profile
app.get('/api/v1/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      customerNo: req.logContext.customerNo,
      name: 'John Doe',
      email: 'john@example.com'
    }
  });
});

// Endpoint that throws an error (to demonstrate error logging)
app.get('/api/v1/product/error-demo', (req, res, next) => {
  const error = new Error('Invalid data provided');
  error.code = 'BR.INVALID.DATA.400';
  error.messageCode = 'M0002';
  error.status = 400;
  next(error);
});

// Create order endpoint
app.post('/api/v1/order/create', (req, res) => {
  const { items, totalAmount } = req.body;
  
  if (!items || items.length === 0) {
    const error = new Error('No items in order');
    error.code = 'BR.INVALID.ORDER.400';
    error.messageCode = 'M0003';
    error.status = 400;
    throw error;
  }
  
  res.json({
    success: true,
    data: {
      orderId: Math.floor(Math.random() * 1000000),
      status: 'created',
      totalAmount: totalAmount
    }
  });
});

// Payment validation endpoint
app.post('/api/v1/payment/validate', (req, res, next) => {
  const { paymentMethod, amount } = req.body;
  
  // Simulate validation error
  if (!paymentMethod || amount <= 0) {
    const error = new Error('Invalid payment details');
    error.code = 'BR.INVALID.PAYMENT.400';
    error.messageCode = 'M0004';
    error.status = 400;
    return next(error);
  }
  
  res.json({
    success: true,
    data: {
      validated: true,
      transactionId: `TXN${Date.now()}`
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Endpoint not found');
  error.code = 'BR.NOT.FOUND.404';
  error.messageCode = 'M0001';
  error.status = 404;
  next(error);
});

// Error handling middleware (must be last)
app.use(errorLogger);

// Start server
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════╗
║   API Logging Application Started              ║
╚════════════════════════════════════════════════╝

🌐 Web UI: http://localhost:${PORT}
📡 Server running on: http://localhost:${PORT}
🆔 Process ID: ${process.pid}
🔧 Environment: ${process.env.NODE_ENV || 'development'}

Available endpoints:
  GET  /api/v1/product/recently-viewed
  GET  /api/v1/product/:id
  GET  /api/v1/user/profile
  GET  /api/v1/product/error-demo (triggers error)
  POST /api/v1/order/create
  POST /api/v1/payment/validate
  GET  /health

📋 Logs are being written to:
  - Console (colored output)
  - ./logs/combined.log (all logs)
  - ./logs/error.log (errors only)

🚀 Quick Start:
  1. Open http://localhost:${PORT} in your browser
  2. Click any "Send Request" button to test APIs
  3. Watch the logs appear in real-time!

Or test via command line:
  curl http://localhost:${PORT}/api/v1/product/error-demo

Press Ctrl+C to stop the server.
  `);
});

module.exports = app;