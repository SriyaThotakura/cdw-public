// Firebase Poll App - Tutorial JavaScript
// This script demonstrates how to integrate Firebase Realtime Database with a simple web app
// It shows real-time data synchronization across multiple users

// Wait for the DOM (Document Object Model) to be fully loaded before running any code
// This ensures all HTML elements exist before we try to access them
document.addEventListener('DOMContentLoaded', function() {
  
  // ========================================
  // STEP 1: FIREBASE CONFIGURATION
  // ========================================
  // Firebase configuration object - this connects your app to your Firebase project
  // You get these values from your Firebase Console (https://console.firebase.google.com)
  // 
  // To set up Firebase:
  // 1. Go to Firebase Console and create a new project
  // 2. Add a web app to your project
  // 3. Copy the config object that Firebase provides
  // 4. Replace the values below with your actual Firebase config
  
  // Firebase configuration object
  const firebaseConfig = {
    apiKey: "AIzaSyCxPm4CTc2a2NgTyguxfTw8OKMhgikkzbw",
    authDomain: "poll-tutorial-14307.firebaseapp.com",
    databaseURL: "https://poll-tutorial-14307-default-rtdb.firebaseio.com",
    projectId: "poll-tutorial-14307",
    storageBucket: "poll-tutorial-14307.appspot.com",
    messagingSenderId: "537495701721",
    appId: "1:537495701721:web:8f23217048f8c8436256c8",
    measurementId: "G-QKTMKPMFKE"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Get a reference to the database service
  const database = firebase.database();

  // ========================================
  // STEP 2: CAPTCHA VERIFICATION
  // ========================================
  let captchaVerified = false;
  
  // Check if CAPTCHA is verified
  function checkCaptchaVerified() {
    return captchaVerified || sessionStorage.getItem('captchaVerified') === 'true';
  }
  
  // Show CAPTCHA if not verified
  function showCaptchaIfNeeded() {
    if (!checkCaptchaVerified()) {
      document.body.classList.add('show-captcha');
      document.body.classList.remove('show-poll-options');
      // Scroll to CAPTCHA
      const captchaEl = document.querySelector('.captcha-container');
      if (captchaEl) {
        captchaEl.scrollIntoView({ behavior: 'smooth' });
      }
      return false;
    }
    return true;
  }
  
  // Function to verify CAPTCHA (to be called from captcha.js)
  window.verifyCaptchaSuccess = function() {
    captchaVerified = true;
    document.body.classList.remove('show-captcha');
    document.body.classList.add('show-poll-options');
    sessionStorage.setItem('captchaVerified', 'true');
  };
  
  // ========================================
  // STEP 3: INITIALIZE THE POLL
  // ========================================
  
  // Only initialize poll if CAPTCHA is verified
  if (checkCaptchaVerified()) {
    document.body.classList.add('show-poll-options');
  } else {
    showCaptchaIfNeeded();
  }
  
  // ========================================
  // STEP 4: GET REFERENCES TO HTML ELEMENTS
  // ========================================
  // We need to get references to the HTML elements we want to update
  // This is like getting "handles" to the parts of the webpage we want to change
  
  // Get references to all poll option elements
  const pollOptions = {
    'yes': {
      button: document.getElementById('vote-yes'),
      count: document.getElementById('yes-count'),
      name: 'Parks & Nature Trails'
    },
    'no': {
      button: document.getElementById('vote-no'),
      count: document.getElementById('no-count'),
      name: 'Urban Plazas & Streets'
    },
    'beach': {
      button: document.getElementById('vote-beach'),
      count: document.getElementById('beach-count'),
      name: 'Beaches & Waterfronts'
    },
    'mountains': {
      button: document.getElementById('vote-mountains'),
      count: document.getElementById('mountains-count'),
      name: 'Mountains & Hiking Trails'
    }
  };

  const totalVotes = document.getElementById('total-votes');
  const connectionStatus = document.getElementById('connection-status');

  // ========================================
  // STEP 3: SET UP REAL-TIME DATABASE LISTENERS
  // ========================================
  // Firebase Realtime Database can automatically update your app when data changes
  // We use .on('value') to listen for any changes to our poll data
  
  // Set up database listeners for each poll option
  Object.entries(pollOptions).forEach(([key, option]) => {
    // Listen for changes to each option's vote count in the database
    database.ref(`poll/${key}`).on('value', function(snapshot) {
      const count = snapshot.val() || 0;
      
      // Update the display on our webpage
      option.count.textContent = `${count} vote${count !== 1 ? 's' : ''}`;
      
      // Update the total votes display
      updateTotalVotes();
      
      console.log(`${option.name} votes updated:`, count);
    });
  });

  // ========================================
  // STEP 4: SET UP BUTTON EVENT LISTENERS
  // ========================================
  // When users click the vote buttons, we need to update the database
  // Firebase will then automatically update all other connected users
  
  // Validate poll option key
  function isValidPollOption(key) {
    return Object.prototype.hasOwnProperty.call(pollOptions, key);
  }
  
  // Validate vote count
  function isValidVoteCount(count) {
    return typeof count === 'number' && 
           Number.isInteger(count) && 
           count >= 0 && 
           count < 1000000; // Reasonable upper limit
  }
  
  // Sanitize user input
  function sanitizeInput(input) {
    if (typeof input === 'string') {
      // Remove any HTML tags and trim whitespace
      return input.replace(/<[^>]*>/g, '').trim();
    }
    return input;
  }
  
  // Set up click handlers for each poll option
  Object.entries(pollOptions).forEach(([key, option]) => {
    option.button.addEventListener('click', async function() {
      // First validate the poll option key
      if (!isValidPollOption(key)) {
        console.error('Invalid poll option selected:', key);
        showError('Invalid selection. Please try again.');
        return;
      }
      
      // Check if CAPTCHA is verified
      if (!showCaptchaIfNeeded()) {
        return;
      }
      
      // Check if user has already voted in this session
      if (hasVotedInSession()) {
        showError('You have already voted in this session.');
        return;
      }
      
      // Check rate limiting
      if (isRateLimited()) {
        showError('Please wait a moment before voting again.');
        return;
      }
      
      console.log(`${option.name} button clicked`);
      
      try {
        // Record the vote attempt timestamp
        recordVoteAttempt();
        
        // Get the current count from the database
        const snapshot = await database.ref(`poll/${key}`).once('value');
        let currentCount = snapshot.val() || 0;
        
        // Validate the current count from the database
        if (!isValidVoteCount(currentCount)) {
          console.error('Invalid vote count in database:', currentCount);
          throw new Error('Invalid vote count');
        }
        
        // Sanitize the new count
        const newCount = currentCount + 1;
        if (!isValidVoteCount(newCount)) {
          console.error('Invalid new vote count:', newCount);
          throw new Error('Invalid new vote count');
        }
        
        // Create a transaction to ensure atomic updates
        await database.ref(`poll/${key}`).set(newCount);
        
        console.log(`Successfully updated ${option.name} votes to ${newCount}`);
        showVoteConfirmation(option.name);
        
        // Record the vote in session storage
        recordVoteInSession();
        
        // Disable voting after successful vote
        disableVoting();
        
      } catch (error) {
        console.error(`Error updating ${option.name} votes:`, error);
        showError('Failed to record your vote. Please try again.');
      }
    });
  });
  
  // Check if user has already voted in this session
  function hasVotedInSession() {
    return sessionStorage.getItem('hasVoted') === 'true';
  }
  
  // Record vote in session storage
  function recordVoteInSession() {
    sessionStorage.setItem('hasVoted', 'true');
    // Set a timestamp for when the vote was recorded
    sessionStorage.setItem('voteTimestamp', Date.now().toString());
  }
  
  // Check if user is rate limited
  function isRateLimited() {
    const lastVoteTime = parseInt(sessionStorage.getItem('lastVoteAttempt') || '0');
    const now = Date.now();
    // 5 second cooldown between votes
    return (now - lastVoteTime) < 5000;
  }
  
  // Record vote attempt timestamp for rate limiting
  function recordVoteAttempt() {
    sessionStorage.setItem('lastVoteAttempt', Date.now().toString());
  }
  
  // Function to disable voting buttons
  function disableVoting() {
    Object.values(pollOptions).forEach(option => {
      option.button.disabled = true;
    });
    
    // Show message that user has already voted
    const voteStatus = document.createElement('p');
    voteStatus.className = 'vote-status';
    voteStatus.textContent = 'Thank you for voting!';
    voteStatus.style.color = '#4CAF50';
    voteStatus.style.marginTop = '10px';
    voteStatus.style.textAlign = 'center';
    
    const totalVotesContainer = document.querySelector('.total-votes');
    if (totalVotesContainer && !document.querySelector('.vote-status')) {
      totalVotesContainer.appendChild(voteStatus);
    }
  }
  
  // Check if user has already voted in this session
  if (sessionStorage.getItem('hasVoted') === 'true') {
    disableVoting();
  }

  // ========================================
  // STEP 5: HELPER FUNCTIONS
  // ========================================
  // These functions help us manage the user interface and provide feedback
  
  /**
   * updateTotalVotes Function
   * Purpose: Calculate and display the total number of votes
   * This function runs whenever either vote count changes
   */
  function updateTotalVotes() {
    // Get all vote counts and calculate the total
    let total = 0;
    
    // Sum up all the votes
    Object.values(pollOptions).forEach(option => {
      const count = parseInt(option.count.textContent) || 0;
      total += count;
    });
    
    // Update the total votes display
    totalVotes.textContent = total;
    
    // Update progress bars
    updateProgressBars(total);
    
    console.log('Total votes:', total);
  }

  /**
   * showVoteConfirmation Function
   * Purpose: Show a brief confirmation message when a vote is recorded
   * @param {string} vote - The vote that was recorded ('Yes' or 'No')
   */
  function showVoteConfirmation(optionName) {
    console.log(`Vote recorded for ${optionName}`);
    
    // Store that user has voted in this session
    sessionStorage.setItem('hasVoted', 'true');
    
    // Get the confirmation message element
    const confirmationMessage = document.getElementById('confirmation-message');
    
    // Update the message text
    confirmationMessage.textContent = `Your vote for "${optionName}" has been recorded!`;
    
    // Show the confirmation message
    confirmationMessage.style.display = 'block';
    
    // Hide the message after 3 seconds
    setTimeout(function() {
      confirmationMessage.style.opacity = '0';
      setTimeout(function() {
        confirmationMessage.style.display = 'none';
        confirmationMessage.style.opacity = '1';
      }, 500);
    }, 3000);
  }

  /**
   * showError Function
   * Purpose: Show an error message if something goes wrong
   * @param {string} message - The error message to display
   */
  function showError(message) {
    const error = document.createElement('div');
    error.className = 'error-message';
    error.textContent = message;
    error.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
    `;
    
    document.body.appendChild(error);
    
    setTimeout(function() {
      if (error.parentNode) {
        error.parentNode.removeChild(error);
      }
    }, 5000);
  }

  // ========================================
  // STEP 6: CONNECTION STATUS MONITORING
  // ========================================
  // Firebase provides connection status information
  // This helps us know if we're connected to the database
  
  // Listen for connection state changes
  database.ref('.info/connected').on('value', function(snapshot) {
    const connected = snapshot.val();
    
    if (connected) {
      // We're connected to Firebase
      connectionStatus.innerHTML = '<p style="color: #4CAF50;">✅ Connected to Firebase</p>';
      console.log('Connected to Firebase');
    } else {
      // We're not connected to Firebase
      connectionStatus.innerHTML = '<p style="color: #f44336;">❌ Disconnected from Firebase</p>';
      console.log('Disconnected from Firebase');
    }
  });

  // ========================================
  // STEP 7: INITIALIZATION
  // ========================================
  // Set up any initial state when the page loads
  
  // Initialize vote counts to 0 if they don't exist in the database
  // This ensures we start with a clean slate
  database.ref('poll').once('value')
    .then(function(snapshot) {
      if (!snapshot.exists()) {
        // If no poll data exists, initialize it with zeros for all options
        const initialData = {};
        Object.keys(pollOptions).forEach(key => {
          initialData[key] = 0;
        });
        return database.ref('poll').set(initialData);
      } else {
        // If poll data exists, ensure all current options are included
        const updates = {};
        Object.keys(pollOptions).forEach(key => {
          if (!snapshot.hasChild(key)) {
            updates[key] = 0;
          }
        });
        if (Object.keys(updates).length > 0) {
          return database.ref('poll').update(updates);
        }
      }
    })
    .then(function() {
      console.log('Poll initialized successfully');
    })
    .catch(function(error) {
      console.error('Error initializing poll:', error);
    });

  // Add CSS animations for the vote confirmation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  console.log('Firebase Poll App initialized successfully!');
  console.log('Tutorial: This app demonstrates real-time data synchronization with Firebase');
});

// ========================================
// FIREBASE TUTORIAL SUMMARY
// ========================================
/*
This tutorial demonstrates several key Firebase concepts:

1. CONFIGURATION: Setting up Firebase with your project credentials
2. DATABASE REFERENCE: Getting a handle to your Realtime Database
3. REAL-TIME LISTENERS: Using .on('value') to automatically update UI when data changes
4. DATA WRITING: Using .set() to save data to the database
5. DATA READING: Using .once('value') to read data once
6. ERROR HANDLING: Managing connection issues and errors
7. CONNECTION MONITORING: Checking if your app is connected to Firebase

Key Benefits of Firebase Realtime Database:
- Automatic synchronization across all connected users
- No server management required
- Real-time updates without page refreshes
- Built-in offline support
- Scalable and secure

To use this in your own project:
1. Create a Firebase project at https://console.firebase.google.com
2. Replace the firebaseConfig object with your actual project settings
3. Set up your database rules in the Firebase Console
4. Deploy your app to Firebase Hosting (optional but recommended)
*/ 