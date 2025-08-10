const fs = require('fs');
const path = require('path');

// Create a directory
fs.mkdir('my-folder', (error) => {
  if (error) {
    console.error('Error creating directory:', error.message);
    return;
  }
  console.log('Directory created successfully');
});

// List files in current directory
fs.readdir('.', (error, files) => {
  if (error) {
    console.error('Error reading directory:', error.message);
    return;
  }
  console.log('Files in current directory:');
  files.forEach(file => {
    console.log(`- ${file}`);
  });
});

// Check if file/directory exists
const filePath = 'hello.js';
if (fs.existsSync(filePath)) {
  console.log(`${filePath} exists`);
} else {
  console.log(`${filePath} does not exist`);
}