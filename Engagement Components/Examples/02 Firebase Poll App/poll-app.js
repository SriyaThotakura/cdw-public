// Firebase Poll App
// Updated to work with new poll options and structure

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

  // Initialize Firebase - this connects your app to Firebase services
  firebase.initializeApp(firebaseConfig);
  
  // Get a reference to the Firebase Realtime Database
  // This is like getting a "handle" to your database that you can use to read/write data
  const database = firebase.database();

  // Get references to HTML elements
  const pollOptions = document.querySelectorAll('.poll-option');
  const connectionStatus = document.getElementById('connection-status');
  const resetButton = document.getElementById('reset-poll');
  const totalVotes = document.getElementById('total-count');
  
  // Poll options configuration
  const options = ['parks', 'cafes', 'transit', 'malls', 'nowhere'];
  
  // Initialize vote counts and progress bars
  const voteCounts = {};
  const progressBars = {};
  
  options.forEach(option => {
    voteCounts[option] = document.getElementById(`${option}-count`);
    progressBars[option] = document.getElementById(`${option}-progress`);
  });
  
  // Add animation class to options on load
  pollOptions.forEach((option, index) => {
    setTimeout(() => {
      option.style.opacity = '1';
      option.style.transform = 'translateY(0)';
    }, 100 * index);
  });

  // Set up real-time database listeners for each option
  options.forEach(option => {
    database.ref(`poll/${option}`).on('value', function(snapshot) {
      const count = snapshot.val() || 0;
      // Update the vote count display
      if (voteCounts[option]) {
        voteCounts[option].textContent = count;
      }
      updateTotalVotes();
      updateProgressBars();
    });
  });

  // Set up event listeners for voting
  pollOptions.forEach(option => {
    option.addEventListener('click', function() {
      const optionType = this.getAttribute('data-option');
      if (!optionType) return;
      
      // Add visual feedback
      this.classList.add('voted');
      
      // Show celebration
      const celebration = document.getElementById('celebration');
      celebration.classList.add('animate');
      setTimeout(() => celebration.classList.remove('animate'), 1000);
      
      // Get current count and update
      database.ref(`poll/${optionType}`).once('value')
        .then(function(snapshot) {
          const currentCount = snapshot.val() || 0;
          return database.ref(`poll/${optionType}`).set(currentCount + 1);
        })
        .then(function() {
          // Show vote confirmation
          const optionText = option.querySelector('.option-text').textContent.split(' ')[0];
          showVoteConfirmation(optionText);
        })
        .catch(function(error) {
          console.error('Error recording vote:', error);
          showError('Failed to record vote. Please try again.');
        });
    });
  });

  // Reset button functionality
  if (resetButton) {
    resetButton.addEventListener('click', function() {
      if (confirm('Are you sure you want to reset all vote counts to zero?')) {
        const updates = {};
        options.forEach(option => {
          updates[`poll/${option}`] = 0;
        });
        
        database.ref().update(updates)
          .then(() => {
            showVoteConfirmation('Poll has been reset');
            // Remove voted class from all options
            document.querySelectorAll('.poll-option').forEach(el => {
              el.classList.remove('voted');
            });
          })
          .catch(error => {
            console.error('Error resetting poll:', error);
            showError('Failed to reset poll.');
          });
      }
    });
  }

  // Get the current count from the database and increment it
    database.ref('poll/no').once('value')
      .then(function(snapshot) {
        const currentCount = snapshot.val() || 0; // Current count, or 0 if none exists
        const newCount = currentCount + 1; // Add 1 to the current count
        
        // Update the database with the new count
        return database.ref('poll/no').set(newCount);
      })
      .then(function() {
        console.log('No vote recorded successfully');
        showVoteConfirmation('No');
      })
      .catch(function(error) {
        console.error('Error recording vote:', error);
        showError('Failed to record vote. Please try again.');
      });
  });

  // ========================================
  // STEP 5: HELPER FUNCTIONS
  // ========================================
  // These functions help us manage the user interface and provide feedback
  
  /**
   * updateTotalVotes Function
   * Purpose: Calculate and display the total number of votes
   * This function runs whenever any vote count changes
   */
  function updateTotalVotes() {
    let total = 0;
    
    // Sum up all votes
    options.forEach(option => {
      if (voteCounts[option]) {
        total += parseInt(voteCounts[option].textContent) || 0;
      }
    });
    
    // Update the total votes display
    if (totalVotes) {
      totalVotes.textContent = total;
    }
    
    // Show or hide the reset button based on total votes
    if (resetButton) {
      resetButton.style.display = total > 0 ? 'inline-block' : 'none';
    }
    
    return total;
  }
  
  /**
   * updateProgressBars Function
   * Purpose: Update the width of progress bars based on vote distribution
   */
  function updateProgressBars() {
    const total = updateTotalVotes();
    
    // Update each progress bar
    options.forEach(option => {
      if (voteCounts[option] && progressBars[option]) {
        const votes = parseInt(voteCounts[option].textContent) || 0;
        const percentage = total > 0 ? (votes / total) * 100 : 0;
        progressBars[option].style.width = `${percentage}%`;
        
        // Show/hide vote count based on whether there are any votes
        const voteCountElement = voteCounts[option].parentElement.querySelector('.vote-count');
        if (voteCountElement) {
          if (votes > 0) {
            voteCountElement.classList.add('visible');
          } else {
            voteCountElement.classList.remove('visible');
          }
        }
      }
    });
  }

  /**
   * showVoteConfirmation Function
   * Purpose: Show a brief confirmation message when a vote is recorded
   * @param {string} vote - The vote that was recorded ('Yes' or 'No')
   */
  function showVoteConfirmation(vote) {
    // Create a temporary confirmation message
    const confirmation = document.createElement('div');
    confirmation.className = 'vote-confirmation';
    confirmation.textContent = `Thank you for voting ${vote === 'Yes' ? 'In the Park' : 'At the Beach'}!`;
    confirmation.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #4CAF50;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      font-size: 16px;
      z-index: 1000;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      animation: slideIn 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
      opacity: 0;
      transform: translateY(-20px);
    `;
    
    // Add the confirmation to the page
    document.body.appendChild(confirmation);
    
    // Remove the confirmation after 3 seconds
    setTimeout(() => {
      confirmation.style.animation = 'fadeOut 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards';
      setTimeout(() => {
        if (confirmation.parentNode) {
          confirmation.parentNode.removeChild(confirmation);
        }
      }, 400);
    }, 2800);
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
  database.ref('poll').once('value')
    .then(function(snapshot) {
      if (!snapshot.exists()) {
        // Initialize with all options set to 0
        const initialData = {};
        options.forEach(option => {
          initialData[option] = 0;
        });
        return database.ref('poll').set(initialData);
      } else {
        // Ensure all current options exist in the database
        const data = snapshot.val() || {};
        const updates = {};
        let needsUpdate = false;
        
        // Check for missing options
        options.forEach(option => {
          if (data[option] === undefined) {
            updates[option] = 0;
            needsUpdate = true;
          }
        });
        
        if (needsUpdate) {
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