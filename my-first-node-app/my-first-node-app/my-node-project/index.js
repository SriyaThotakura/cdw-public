const express = require('express');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
  res.send(`
    <h1>Welcome to my Node.js app!</h1>
    <p>This is served using Express.js</p>
  `);
});

app.get('/api/status', (req, res) => {
  res.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.post('/api/echo', (req, res) => {
  res.json({
    message: 'Echo response',
    data: req.body
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
// Simple debugging
console.log('Debug info:', { user: 'john', action: 'login' });

// Using debugger statement
function complexFunction() {
  let result = 0;
  
  for (let i = 0; i < 10; i++) {
    result += i;
    debugger; // Browser dev tools will pause here
  }
  
  return result;
}

// Run with debugging enabled
// node --inspect app.js
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbUrl = process.env.DATABASE_URL;
const apiKey = process.env.API_KEY;

console.log('Port:', port);
console.log('Database URL:', dbUrl);