const fs = require('fs');

// Write a file synchronously
try {
  fs.writeFileSync('output.txt', 'Hello from Node.js!');
  console.log('File written successfully');
} catch (error) {
  console.error('Error writing file:', error.message);
}

// Write a file asynchronously
fs.writeFile('output-async.txt', 'Hello from Node.js (async)!', (error) => {
  if (error) {
    console.error('Error writing file:', error.message);
    return;
  }
  console.log('File written successfully (async)');
});