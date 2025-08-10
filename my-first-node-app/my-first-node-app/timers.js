// setTimeout - run code after a delay
console.log('Starting timer example...');

setTimeout(() => {
  console.log('This runs after 2 seconds');
}, 2000);

// setInterval - run code repeatedly
let counter = 0;
const interval = setInterval(() => {
  counter++;
  console.log(`Counter: ${counter}`);
  
  if (counter >= 5) {
    clearInterval(interval);
    console.log('Interval stopped');
  }
}, 1000);

// Immediate execution
setImmediate(() => {
  console.log('This runs immediately after current execution');
});

console.log('Timer example setup complete');