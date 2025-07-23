// CAPTCHA Implementation
class CaptchaVerifier {
  constructor() {
    this.captchaText = document.getElementById('captcha-text');
    this.captchaInput = document.getElementById('captcha-input');
    this.refreshBtn = document.getElementById('refresh-captcha');
    this.verifyBtn = document.getElementById('verify-captcha');
    this.statusEl = document.getElementById('captcha-status');
    
    this.currentCaptcha = '';
    
    // Only initialize if all required elements exist
    if (this.captchaText && this.captchaInput && this.refreshBtn && this.verifyBtn && this.statusEl) {
      this.init();
    } else {
      console.error('CAPTCHA elements not found');
    }
  }
  
  init() {
    // Generate initial CAPTCHA
    this.generateCaptcha();
    
    // Set up event listeners
    this.refreshBtn.addEventListener('click', () => this.generateCaptcha());
    this.verifyBtn.addEventListener('click', () => this.verifyCaptcha());
    this.captchaInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.verifyCaptcha();
    });
    
    // Show CAPTCHA container
    document.querySelector('.captcha-container').style.display = 'block';
  }
  
  generateCaptcha() {
    // Clear previous status
    this.statusEl.textContent = '';
    this.statusEl.className = 'captcha-status';
    this.captchaInput.value = '';
    
    // Generate random 6-character CAPTCHA
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    this.currentCaptcha = '';
    
    for (let i = 0; i < 6; i++) {
      this.currentCaptcha += chars[Math.floor(Math.random() * chars.length)];
    }
    
    // Display the CAPTCHA with some styling
    this.captchaText.innerHTML = '';
    for (let i = 0; i < this.currentCaptcha.length; i++) {
      const char = document.createElement('span');
      char.textContent = this.currentCaptcha[i];
      // Add some random rotation and spacing
      const rotation = Math.floor(Math.random() * 31) - 15; // -15 to 15 degrees
      const spacing = Math.floor(Math.random() * 5); // 0 to 5px
      char.style.transform = `rotate(${rotation}deg)`;
      char.style.display = 'inline-block';
      char.style.margin = `0 ${spacing}px`;
      // Add some noise
      if (Math.random() > 0.7) {
        char.style.color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      }
      this.captchaText.appendChild(char);
    }
    
    // Add some lines through the text for extra security
    const line1 = document.createElement('div');
    line1.style.position = 'absolute';
    line1.style.width = '100%';
    line1.style.height = '2px';
    line1.style.background = 'rgba(0,0,0,0.2)';
    line1.style.transform = 'rotate(-5deg)';
    line1.style.top = '30%';
    
    const line2 = document.createElement('div');
    line2.style.position = 'absolute';
    line2.style.width = '100%';
    line2.style.height = '2px';
    line2.style.background = 'rgba(0,0,0,0.2)';
    line2.style.transform = 'rotate(5deg)';
    line2.style.top = '70%';
    
    this.captchaText.style.position = 'relative';
    this.captchaText.appendChild(line1);
    this.captchaText.appendChild(line2);
  }
  
  verifyCaptcha() {
    const userInput = this.captchaInput.value.trim().toUpperCase();
    
    if (!userInput) {
      this.showStatus('Please enter the CAPTCHA text', 'error');
      return false;
    }
    
    if (userInput === this.currentCaptcha) {
      this.showStatus('Verification successful!', 'success');
      
      // Call the global verification success function
      if (typeof window.verifyCaptchaSuccess === 'function') {
        window.verifyCaptchaSuccess();
      }
      
      return true;
    } else {
      this.showStatus('Incorrect CAPTCHA. Please try again.', 'error');
      this.generateCaptcha();
      return false;
    }
  }
  
  showStatus(message, type) {
    this.statusEl.textContent = message;
    this.statusEl.className = `captcha-status ${type}`;
  }
  
  isVerified() {
    return this.verified || sessionStorage.getItem('captchaVerified') === 'true';
  }
}

// Initialize CAPTCHA when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize CAPTCHA if we're on a page with the CAPTCHA elements
  if (document.getElementById('captcha-verification')) {
    // Create a global instance of the CAPTCHA verifier
    window.captcha = new CaptchaVerifier();
    
    // If already verified, show the poll options
    if (sessionStorage.getItem('captchaVerified') === 'true') {
      document.body.classList.add('show-poll-options');
    } else {
      document.body.classList.add('show-captcha');
    }
  }
});
