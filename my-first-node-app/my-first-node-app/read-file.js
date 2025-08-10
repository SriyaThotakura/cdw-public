const fs = require('fs');

// Read a file synchronously
try {
  const data = fs.readFileSync('hello.js', 'utf8');
  console.log('File contents:');
  console.log(data);
} catch (error) {
  console.error('Error reading file:', error.message);
}

// Read a file asynchronously (recommended)
fs.readFile('hello.js', 'utf8', (error, data) => {
  if (error) {
    console.error('Error reading file:', error.message);
    return;
  }
  console.log('File contents (async):');
  console.log(data);
});