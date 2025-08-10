// AI Chat Application
class AIChat {
  constructor() {
    // DOM Elements
    this.chatContainer = document.getElementById('chat-container');
    this.userInput = document.getElementById('user-input');
    this.sendBtn = document.getElementById('send-btn');
    this.emojiBtn = document.getElementById('emoji-btn');
    this.typingIndicator = document.getElementById('typing-indicator');
    this.welcomeMessage = document.querySelector('.welcome-message');
    
    // Auth Elements
    this.authSection = document.getElementById('auth-section');
    this.loginBtn = document.getElementById('login-btn');
    this.usernameInput = document.getElementById('username');
    this.passwordInput = document.getElementById('password');
    
    // App State
    this.isAuthenticated = false;
    this.currentUser = null;
    this.conversationHistory = [];
    this.isTyping = false;
    
    // Initialize the app
    this.initializeEventListeners();
    this.initializeEmojiPicker();
    this.checkAuthState();
    this.setupTextareaAutoResize();
  }
  
  initializeEventListeners() {
    // Send message on button click or Enter key
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });
    
    // Login functionality
    this.loginBtn.addEventListener('click', () => this.handleLogin());
    this.passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.handleLogin();
    });
  }
  
  initializeEmojiPicker() {
    // Initialize emoji picker
    const picker = document.createElement('emoji-picker');
    picker.classList.add('emoji-picker');
    document.body.appendChild(picker);
    
    // Toggle emoji picker
    this.emojiBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const picker = document.querySelector('emoji-picker');
      picker.classList.toggle('visible');
      
      // Position picker above the input
      const rect = this.emojiBtn.getBoundingClientRect();
      picker.style.position = 'fixed';
      picker.style.bottom = `${window.innerHeight - rect.top + 10}px`;
      picker.style.left = `${rect.left}px`;
      picker.style.zIndex = '1000';
    });
    
    // Handle emoji selection
    picker.addEventListener('emoji-click', (event) => {
      this.userInput.value += event.detail.unicode;
      this.userInput.focus();
      picker.classList.remove('visible');
    });
    
    // Close picker when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('emoji-picker') && !e.target.closest('#emoji-btn')) {
        document.querySelector('emoji-picker')?.classList.remove('visible');
      }
    });
  }
  
  checkAuthState() {
    const savedData = localStorage.getItem('aiChatData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.user && data.conversation) {
          this.currentUser = data.user;
          this.conversationHistory = data.conversation;
          this.isAuthenticated = true;
          this.updateUIForAuthState();
          this.hideWelcomeMessage();
          this.restoreChat();
        }
      } catch (e) {
        console.error('Error loading saved data:', e);
      }
    } else {
      this.showWelcomeMessage();
    }
  }
  
  async handleLogin() {
    const username = this.usernameInput.value.trim();
    const password = this.passwordInput.value;
    
    // Basic validation
    if (!username) {
      this.showError('Please enter a username');
      return;
    }
    
    if (!password) {
      this.showError('Please enter a password');
      return;
    }
    
    // In a real app, you would validate credentials with a server
    this.currentUser = username;
    this.isAuthenticated = true;
    
    // Save user data
    this.saveToLocalStorage();
    
    // Update UI
    this.updateUIForAuthState();
    this.hideWelcomeMessage();
    
    // Add welcome message
    this.addMessage('ai', `Hello ${username}! I'm your AI assistant. How can I help you today?`);
  }
  
  handleLogout() {
    if (confirm('Are you sure you want to log out?')) {
      this.isAuthenticated = false;
      this.currentUser = null;
      this.conversationHistory = [];
      this.updateUIForAuthState();
      this.clearChat();
      this.showWelcomeMessage();
      localStorage.removeItem('aiChatData');
    }
  }
  
  updateUIForAuthState() {
    if (this.isAuthenticated) {
      // Update header
      this.authSection.innerHTML = `
        <div class="user-info">
          <div class="avatar">${this.currentUser.charAt(0).toUpperCase()}</div>
          <span>${this.currentUser}</span>
          <button class="btn btn-text" id="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      `;
      
      // Enable chat interface
      this.userInput.disabled = false;
      this.sendBtn.disabled = false;
      this.emojiBtn.disabled = false;
      this.userInput.focus();
      
      // Add logout handler
      document.getElementById('logout-btn').addEventListener('click', () => this.handleLogout());
    } else {
      // Show login form
      this.authSection.innerHTML = `
        <div class="auth-inputs">
          <input 
            type="text" 
            id="username" 
            class="auth-input" 
            placeholder="Username"
            value="${this.usernameInput?.value || ''}"
          >
          <input 
            type="password" 
            id="password" 
            class="auth-input" 
            placeholder="Password"
          >
        </div>
        <button class="btn login-btn" id="login-btn">
          <i class="fas fa-sign-in-alt"></i> Login
        </button>
      `;
      
      // Update references and re-add event listeners
      this.loginBtn = document.getElementById('login-btn');
      this.usernameInput = document.getElementById('username');
      this.passwordInput = document.getElementById('password');
      
      this.loginBtn.addEventListener('click', () => this.handleLogin());
      this.passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleLogin();
      });
      
      // Disable chat interface
      this.userInput.disabled = true;
      this.sendBtn.disabled = true;
      this.emojiBtn.disabled = true;
    }
  }
  
  async handleSendMessage() {
    const message = this.userInput.value.trim();
    if (!message || this.isTyping) return;
    
    // Clear input and add message to chat
    this.userInput.value = '';
    this.addMessage('user', message);
    
    try {
      // Show typing indicator
      this.showTypingIndicator();
      
      // Add user message to history
      this.conversationHistory.push({ role: 'user', content: message });
      
      // Call OpenAI API
      const response = await this.callOpenAI(message);
      
      // Hide typing indicator and show response
      this.hideTypingIndicator();
      this.addMessage('ai', response);
      
      // Add AI response to history
      this.conversationHistory.push({ role: 'assistant', content: response });
      
      // Save conversation
      this.saveToLocalStorage();
      
    } catch (error) {
      console.error('Error:', error);
      this.hideTypingIndicator();
      this.addMessage('ai', `Sorry, I encountered an error: ${error.message}`, 'error');
    }
  }
  
async callOpenAI(message) {
    // Replace with your actual OpenAI API key
    const apiKey = 'YOUR_OPENAI_API_KEY'; //<-API Key

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant. Provide clear and concise responses.'
          },
          ...this.conversationHistory.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to get response from AI');
    }
    
    const data = await response.json();
    return data.choices[0]?.message?.content || 'I\'m not sure how to respond to that.';
  }
  
  addMessage(role, content, type = 'normal') {
    const messageId = `msg-${Date.now()}`;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const messageDiv = document.createElement('div');
    messageDiv.id = messageId;
    messageDiv.className = `message ${role}-message`;
    
    if (type === 'error') {
      messageDiv.innerHTML = `
        <div class="message-content error">
          <i class="fas fa-exclamation-circle"></i>
          <span>${content}</span>
        </div>
        <div class="message-timestamp">${timestamp}</div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-content">
          ${role === 'user' ? content : marked.parse(content || '')}
        </div>
        <div class="message-timestamp">${timestamp}</div>
      `;
    }
    
    this.chatContainer.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Hide welcome message after first message
    if (role === 'user') {
      this.hideWelcomeMessage();
    }
    
    return messageDiv;
  }
  
  showTypingIndicator() {
    this.isTyping = true;
    this.typingMessage = document.createElement('div');
    this.typingMessage.className = 'message ai-message typing';
    this.typingMessage.innerHTML = `
      <div class="typing-indicator visible">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    this.chatContainer.appendChild(this.typingMessage);
    this.typingMessage.scrollIntoView({ behavior: 'smooth' });
  }
  
  hideTypingIndicator() {
    this.isTyping = false;
    if (this.typingMessage && this.typingMessage.parentNode) {
      this.typingMessage.remove();
      this.typingMessage = null;
    }
  }
  
  showWelcomeMessage() {
    this.welcomeMessage.style.display = 'flex';
  }
  
  hideWelcomeMessage() {
    this.welcomeMessage.style.display = 'none';
  }
  
  clearChat() {
    this.chatContainer.innerHTML = '';
    this.conversationHistory = [];
    this.saveToLocalStorage();
  }
  
  restoreChat() {
    this.chatContainer.innerHTML = '';
    this.conversationHistory.forEach(msg => {
      this.addMessage(msg.role, msg.content);
    });
  }
  
  saveToLocalStorage() {
    if (!this.isAuthenticated || !this.currentUser) return;
    
    const data = {
      user: this.currentUser,
      conversation: this.conversationHistory,
      timestamp: Date.now()
    };
    
    localStorage.setItem('aiChatData', JSON.stringify(data));
  }
  
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      <span>${message}</span>
    `;
    
    // Add to DOM
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
      errorDiv.classList.add('fade-out');
      setTimeout(() => errorDiv.remove(), 300);
    }, 3000);
  }
  
  setupTextareaAutoResize() {
    const textarea = this.userInput;
    textarea.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Add some basic markdown formatting
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && e.shiftKey) {
        // Allow Shift+Enter for new lines
        return;
      }
      
      // Format code block with ```
      if (e.key === '`' && e.ctrlKey) {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        const beforeText = textarea.value.substring(0, start);
        const afterText = textarea.value.substring(end);
        
        if (selectedText.includes('\n')) {
          // Multi-line code block
          textarea.value = beforeText + '```\n' + selectedText + '\n```\n' + afterText;
          textarea.selectionStart = textarea.selectionEnd = start + 4 + selectedText.length;
        } else {
          // Inline code
          textarea.value = beforeText + '`' + selectedText + '`' + afterText;
          textarea.selectionStart = textarea.selectionEnd = start + 1 + selectedText.length;
        }
        
        // Trigger input event for auto-resize
        const event = new Event('input');
        textarea.dispatchEvent(event);
      }
    });
  }
}

// Initialize the chat when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Add emoji picker styles
  const style = document.createElement('style');
  style.textContent = `
    emoji-picker {
      --emoji-size: 1.5rem;
      --emoji-padding: 0.5rem;
      --category-emoji-size: 1.2rem;
      --background: #fff;
      --border-color: #e9ecef;
      --input-border-color: #dee2e6;
      --indicator-color: #4a6cf7;
      --num-columns: 8;
      --emoji-size: 2rem;
      --category-emoji-size: 1.5rem;
      position: fixed;
      bottom: 70px;
      right: 20px;
      z-index: 1000;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      border-radius: 12px;
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.2s ease;
      pointer-events: none;
    }
    
    emoji-picker.visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
    
    .error-message {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(0);
      background: #ff4444;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1100;
      transition: all 0.3s ease;
    }
    
    .error-message.fade-out {
      opacity: 0;
      transform: translateX(-50%) translateY(20px);
    }
    
    @media (max-width: 480px) {
      emoji-picker {
        left: 10px;
        right: 10px;
        width: calc(100% - 20px);
      }
    }
    
    /* Ensure the chat container takes up available space */
    .chat-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    
    /* Style for the welcome message */
    .welcome-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      height: 100%;
      color: #666;
    }
    
    .welcome-message i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #4a6cf7;
    }
    
    .welcome-message h2 {
      margin: 0.5rem 0;
      color: #333;
    }
    
    /* Input area styling */
    .input-container {
      padding: 1rem;
      background: #fff;
      border-top: 1px solid #e9ecef;
    }
    
    .input-area {
      display: flex;
      align-items: flex-end;
      gap: 0.5rem;
    }
    
    .input-wrapper {
      flex: 1;
      display: flex;
      border: 1px solid #dee2e6;
      border-radius: 1.5rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
    }
    
    #user-input {
      flex: 1;
      border: none;
      background: transparent;
      resize: none;
      outline: none;
      font-family: inherit;
      font-size: 1rem;
      line-height: 1.5;
      max-height: 120px;
      overflow-y: auto;
    }
    
    /* Buttons */
    .btn-icon {
      background: none;
      border: none;
      color: #6c757d;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    
    .btn-icon:hover {
      background: #e9ecef;
      color: #4a6cf7;
    }
    
    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    /* Typing indicator */
    .typing-indicator {
      display: flex;
      gap: 0.25rem;
      padding: 0.5rem 1rem;
      background: #f8f9fa;
      border-radius: 1.5rem;
      margin-bottom: 0.5rem;
      align-self: flex-start;
      display: none;
    }
    
    .typing-indicator.visible {
      display: flex;
    }
    
    .typing-dot {
      width: 8px;
      height: 8px;
      background: #6c757d;
      border-radius: 50%;
      animation: typingAnimation 1.4s infinite ease-in-out;
    }
    
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes typingAnimation {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-4px); }
    }
    
    /* Message styles */
    .message {
      max-width: 80%;
      padding: 0.75rem 1rem;
      border-radius: 1.25rem;
      position: relative;
      line-height: 1.5;
      word-wrap: break-word;
      animation: messageAppear 0.3s ease-out;
    }
    
    @keyframes messageAppear {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .user-message {
      align-self: flex-end;
      background: #4a6cf7;
      color: white;
      border-bottom-right-radius: 0.25rem;
    }
    
    .ai-message {
      align-self: flex-start;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-bottom-left-radius: 0.25rem;
    }
    
    .message-content {
      margin-bottom: 0.25rem;
    }
    
    .message-timestamp {
      font-size: 0.7rem;
      opacity: 0.8;
      text-align: right;
    }
    
    .user-message .message-timestamp {
      color: rgba(255, 255, 255, 0.8);
    }
    
    .ai-message .message-timestamp {
      color: #6c757d;
    }
    
    /* Auth section */
    .auth-section {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }
    
    .auth-input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #dee2e6;
      border-radius: 0.375rem;
      font-size: 0.9rem;
    }
    
    .auth-input:focus {
      outline: none;
      border-color: #4a6cf7;
      box-shadow: 0 0 0 2px rgba(74, 108, 247, 0.2);
    }
    
    .btn {
      background: #4a6cf7;
      color: white;
      border: none;
      border-radius: 0.375rem;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background 0.2s;
    }
    
    .btn:hover {
      background: #3a5bd9;
    }
    
    .btn:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #4a6cf7;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }`;
  document.head.appendChild(style);
  
  // Initialize the chat
  window.chatApp = new AIChat();
  
  // Add global error handler
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    if (window.chatApp) {
      window.chatApp.showError('An error occurred. Please try again.');
    }
  });
});