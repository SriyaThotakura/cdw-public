// Access environment variables
console.log('Node.js version:', process.version);
console.log('Current working directory:', process.cwd());
console.log('Platform:', process.platform);

// Set and access custom environment variables
process.env.MY_CUSTOM_VAR = 'Hello from environment!';
console.log('Custom variable:', process.env.MY_CUSTOM_VAR);

// Access command line arguments
console.log('Command line arguments:', process.argv);