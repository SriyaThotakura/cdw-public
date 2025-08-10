const http = require('http');

// Create a simple HTTP server
const server = http.createServer((request, response) => {
  // Set response headers
  response.writeHead(200, { 'Content-Type': 'text/html' });
  
  // Send response
  response.end(`
    <html>
      <head>
        <title>My Node.js Server</title>
      </head>
      <body>
        <h1>Hello from Node.js!</h1>
        <p>Current time: ${new Date().toLocaleString()}</p>
        <p>Request URL: ${request.url}</p>
      </body>
    </html>
  `);
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server');
});