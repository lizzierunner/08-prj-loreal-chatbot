/**
 * L'Oréal Beauty Assistant Chatbot
 * 
 * A sophisticated AI-powered beauty consultant featuring:
 * - OpenAI GPT-4o integration
 * - Conversation persistence with localStorage
 * - Dark/light mode theming
 * - Voice input support
 * - Smart product links
 * - Export functionality
 * - Real-time analytics tracking
 * 
 * @author Lizzie Johnson
 * @version 2.0
 * @license Educational Use
 */

/* ========================================
   DOM ELEMENT REFERENCES
   ======================================== */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

/* ========================================
   GLOBAL STATE
   ======================================== */
// Chat history to maintain conversation context
let conversationHistory = [];

/**
 * Load conversation history from localStorage on startup
 * Enables conversation persistence across browser sessions
 */
function loadConversationHistory() {
  const saved = localStorage.getItem('lorealChatHistory');
  if (saved) {
    try {
      conversationHistory = JSON.parse(saved);
      console.log('✅ Loaded conversation history from localStorage');
    } catch (e) {
      console.error('❌ Error loading conversation history:', e);
      conversationHistory = [];
    }
  }
}

// Save conversation history to localStorage
function saveConversationHistory() {
  try {
    localStorage.setItem('lorealChatHistory', JSON.stringify(conversationHistory));
    console.log('Saved conversation history to localStorage');
  } catch (e) {
    console.error('Error saving conversation history:', e);
  }
}

// Load saved messages and display them in chat window
function loadSavedMessages() {
  const saved = localStorage.getItem('lorealChatMessages');
  if (saved) {
    try {
      const messages = JSON.parse(saved);
      messages.forEach(msg => {
        displayMessage(msg.text, msg.sender, false); // false = don't save again
      });
      console.log('Loaded saved messages');
    } catch (e) {
      console.error('Error loading saved messages:', e);
    }
  }
}

// Save all messages to localStorage
function saveMessages() {
  try {
    const messages = [];
    const allMessages = chatWindow.querySelectorAll('.msg');
    allMessages.forEach(msg => {
      const text = msg.querySelector('.msg-text')?.textContent;
      const sender = msg.classList.contains('user') ? 'user' : 'ai';
      if (text && !msg.classList.contains('quick-replies')) {
        messages.push({ text, sender });
      }
    });
    localStorage.setItem('lorealChatMessages', JSON.stringify(messages));
  } catch (e) {
    console.error('Error saving messages:', e);
  }
}

// L'Oréal product knowledge system prompt
const systemPrompt = `You are a friendly and knowledgeable L'Oréal Beauty Assistant. You help customers discover and understand L'Oréal's extensive range of products including makeup, skincare, haircare, and fragrances.

Your expertise includes:
- L'Oréal makeup products (foundations, lipsticks, mascaras, eyeshadows, etc.)
- Skincare routines and products (cleansers, moisturizers, serums, anti-aging)
- Haircare solutions (shampoos, conditioners, styling products, color treatments)
- Fragrances for men and women
- Personalized beauty routines and recommendations
- Application tips and techniques
- Product ingredients and benefits

IMPORTANT: You ONLY answer questions related to:
- L'Oréal products and beauty topics
- Makeup, skincare, haircare, and fragrance advice
- Beauty routines and recommendations
- L'Oréal brand information

If a user asks about topics unrelated to L'Oréal products or beauty (politics, sports, math, coding, etc.), politely respond: "I'm here specifically to help with L'Oréal beauty products and routines. Is there anything about makeup, skincare, haircare, or fragrances I can help you with today? Because You're Worth It! ✨"

Always:
- Be enthusiastic about beauty and L'Oréal products
- Provide personalized recommendations based on user needs
- Mention specific L'Oréal product lines when relevant
- Keep responses helpful, friendly, and professional
- Ask follow-up questions to better understand user needs
- Emphasize L'Oréal's motto "Because You're Worth It"

Keep responses concise but informative (2-3 sentences typically).`;

// Initialize chat with welcome message
function initializeChat() {
  // Load saved conversation history
  loadConversationHistory();
  
  // Check if we have saved messages
  const savedMessages = localStorage.getItem('lorealChatMessages');
  
  if (savedMessages) {
    // Load existing conversation
    loadSavedMessages();
  } else {
    // Show welcome message for new users
    const welcomeMessage = `✨ Welcome to L'Oréal Beauty Assistant! ✨

I'm your personal beauty expert powered by AI.

I can help you with:
💄 Makeup recommendations
🧴 Skincare routines  
💇‍♀️ Haircare solutions
🌸 Fragrance suggestions

What can I help you with today? 💬`;

    displayMessage(welcomeMessage, 'ai');
    
    // Add instruction text BEFORE buttons
    const instructionMessage = `Click a topic below to get started:`;
    displayMessage(instructionMessage, 'ai');
    
    // Show quick reply buttons LAST
    showQuickReplies();
  }
}

// Show quick reply suggestion buttons
function showQuickReplies() {
  // Popular questions users might ask
  const quickReplies = [
    "Foundation for oily skin",
    "Anti-aging routine",
    "Best mascara",
    "Damaged hair solutions"
  ];
  
  // Create container for quick reply buttons
  const quickReplyDiv = document.createElement('div');
  quickReplyDiv.classList.add('quick-replies');
  quickReplyDiv.id = 'quick-replies';
  
  // Add spacer to push buttons down visually
  quickReplyDiv.style.marginTop = '40px';
  quickReplyDiv.style.paddingTop = '40px';
  quickReplyDiv.style.display = 'block';
  quickReplyDiv.style.clear = 'both';
  
  // Create a button for each quick reply
  quickReplies.forEach(reply => {
    const button = document.createElement('button');
    button.classList.add('quick-reply-btn');
    button.textContent = reply;
    button.addEventListener('click', () => {
      // When clicked, fill input and submit form
      userInput.value = reply;
      chatForm.dispatchEvent(new Event('submit'));
      // Remove quick replies after use
      document.getElementById('quick-replies')?.remove();
    });
    quickReplyDiv.appendChild(button);
  });
  
  chatWindow.appendChild(quickReplyDiv);
  
  // Force scroll to show everything
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Display message in chat window
function displayMessage(message, sender, shouldSave = true) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('msg', sender);
  
  // ⭐ FEATURE 1: Add animated expert avatar for AI messages
  if (sender === 'ai') {
    const avatar = document.createElement('div');
    avatar.classList.add('expert-avatar');
    avatar.innerHTML = '<div class="avatar-pulse"></div><span class="avatar-icon">✨</span>';
    messageDiv.appendChild(avatar);
  }
  
  // Create text content with smart product links
  const textSpan = document.createElement('span');
  textSpan.classList.add('msg-text');
  
  // Add smart product links for AI messages
  if (sender === 'ai') {
    // Enhance with product cards FIRST
    let enhancedMessage = enhanceProductMentions(message);
    
    // ⭐ FEATURE 2: Add product recommendation scores based on beauty profile
    enhancedMessage = addRecommendationScores(enhancedMessage);
    
    textSpan.innerHTML = addProductLinks(enhancedMessage);
  } else {
    textSpan.textContent = message;
  }
  
  messageDiv.appendChild(textSpan);
  
  // Add special features for AI messages
  if (sender === 'ai') {
    // Add copy button for AI responses
    const copyBtn = document.createElement('button');
    copyBtn.classList.add('copy-btn');
    copyBtn.innerHTML = '<span class="material-icons">content_copy</span>';
    copyBtn.title = 'Copy message';
    copyBtn.addEventListener('click', () => {
      // Copy message to clipboard
      navigator.clipboard.writeText(message).then(() => {
        // Show success feedback
        copyBtn.innerHTML = '<span class="material-icons">check</span>';
        copyBtn.style.color = 'var(--loreal-red)';
        setTimeout(() => {
          copyBtn.innerHTML = '<span class="material-icons">content_copy</span>';
          copyBtn.style.color = '';
        }, 2000);
      });
    });
    messageDiv.appendChild(copyBtn);
    
    // Add product category tags
    const tags = addProductTags(message);
    if (tags) {
      messageDiv.appendChild(tags);
    }
    
    // Add feedback buttons (thumbs up/down)
    const feedbackDiv = document.createElement('div');
    feedbackDiv.classList.add('feedback-buttons');
    
    const thumbsUp = document.createElement('button');
    thumbsUp.classList.add('feedback-btn');
    thumbsUp.innerHTML = '👍';
    thumbsUp.title = 'Helpful';
    thumbsUp.addEventListener('click', () => handleFeedback('positive', messageDiv));
    
    const thumbsDown = document.createElement('button');
    thumbsDown.classList.add('feedback-btn');
    thumbsDown.innerHTML = '👎';
    thumbsDown.title = 'Not helpful';
    thumbsDown.addEventListener('click', () => handleFeedback('negative', messageDiv));
    
    feedbackDiv.appendChild(thumbsUp);
    feedbackDiv.appendChild(thumbsDown);
    messageDiv.appendChild(feedbackDiv);
    
    // ⭐ ADD SHARE BUTTON for AI messages
    const shareButton = createShareButton(message);
    messageDiv.appendChild(shareButton);
  }
  
  chatWindow.appendChild(messageDiv);
  
  // ⭐ Track consultation data for summary
  trackConsultationData(message, sender);
  
  // Save messages to localStorage (if shouldSave is true)
  if (shouldSave) {
    saveMessages();
  }
  
  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Detect product categories mentioned in AI response and add visual tags
function addProductTags(message) {
  // Product category keywords to detect
  const categories = {
    'makeup': ['foundation', 'lipstick', 'mascara', 'eyeshadow', 'blush', 'concealer', 'eyeliner', 'makeup'],
    'skincare': ['cleanser', 'moisturizer', 'serum', 'cream', 'toner', 'exfoliator', 'skincare', 'anti-aging'],
    'haircare': ['shampoo', 'conditioner', 'treatment', 'styling', 'color', 'hair', 'haircare'],
    'fragrance': ['perfume', 'cologne', 'scent', 'fragrance']
  };
  
  const tags = new Set();
  const messageLower = message.toLowerCase();
  
  // Check which categories are mentioned
  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(word => messageLower.includes(word))) {
      tags.add(category);
    }
  }
  
  // Create tag elements if any categories found
  if (tags.size > 0) {
    const tagDiv = document.createElement('div');
    tagDiv.classList.add('product-tags');
    tags.forEach(tag => {
      const tagSpan = document.createElement('span');
      tagSpan.classList.add('product-tag', `tag-${tag}`);
      tagSpan.textContent = tag;
      tagDiv.appendChild(tagSpan);
    });
    return tagDiv;
  }
  return null;
}

// ===== SMART PRODUCT LINKS FEATURE =====

// Convert L'Oréal product mentions into clickable links
function addProductLinks(text) {
  // Common L'Oréal product names and lines
  const products = {
    // Makeup lines
    'Infallible': 'makeup/infallible',
    'Infallible Pro-Matte': 'makeup/infallible-pro-matte',
    'True Match': 'makeup/true-match',
    'Voluminous': 'makeup/voluminous-mascara',
    'Colour Riche': 'makeup/colour-riche',
    'Paradise': 'makeup/paradise',
    
    // Skincare lines
    'RevitaLift': 'skincare/revitalift',
    'Hyaluronic Acid': 'skincare/hyaluronic-acid',
    'Age Perfect': 'skincare/age-perfect',
    'Pure Clay': 'skincare/pure-clay',
    
    // Haircare lines
    'Elvive': 'hair/elvive',
    'Ever': 'hair/ever',
    'Feria': 'hair/feria',
    'Excellence': 'hair/excellence'
  };
  
  let linkedText = text;
  
  // Replace product names with links
  for (const [productName, url] of Object.entries(products)) {
    const regex = new RegExp(`\\b(${productName})\\b`, 'gi');
    linkedText = linkedText.replace(regex, (match) => {
      return `<a href="https://www.loreal-paris.com/en-us/${url}" target="_blank" rel="noopener" class="product-link">${match}</a>`;
    });
  }
  
  return linkedText;
}

// Handle user feedback on AI responses
function handleFeedback(type, messageDiv) {
  const feedbackDiv = messageDiv.querySelector('.feedback-buttons');
  // Replace buttons with thank you message
  feedbackDiv.innerHTML = `<span class="feedback-thanks">Thanks for your feedback! ✨</span>`;
  
  // Log feedback (in a real app, you'd send this to analytics)
  console.log(`User feedback: ${type}`);
}

// Show loading indicator with animated typing dots
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('msg', 'ai');
  loadingDiv.id = 'loading-message';
  
  // Create animated typing indicator (three bouncing dots)
  loadingDiv.innerHTML = `
    <div class="typing-indicator">
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;
  
  chatWindow.appendChild(loadingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Remove loading indicator
function hideLoading() {
  const loadingMessage = document.getElementById('loading-message');
  if (loadingMessage) {
    loadingMessage.remove();
  }
}

// Send message to OpenAI API via Cloudflare Worker
async function sendToOpenAI(userMessage) {
  try {
    conversationHistory.push({ role: "user", content: userMessage });
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];
    const cloudflareWorkerUrl = 'https://loreal-chatbot-03.esjohn15.workers.dev/';
    const response = await fetch(cloudflareWorkerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages })
    });
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    conversationHistory.push({ role: "assistant", content: aiResponse });
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    return aiResponse;
  } catch (error) {
    console.error('Error:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again. Because You're Worth It! ✨";
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (!message) return;
  
  // Track message sent
  updateAnalytics('messageSent');
  
  // Display user message
  displayMessage(message, 'user');
  
  // Clear input and disable send button
  userInput.value = '';
  sendBtn.disabled = true;
  
  // Show loading indicator
  showLoading();
  
  try {
    // Get AI response
    const aiResponse = await sendToOpenAI(message);
    
    // Hide loading and display AI response
    hideLoading();
    displayMessage(aiResponse, 'ai');
    
  } catch (error) {
    hideLoading();
    displayMessage("I'm sorry, I encountered an error. Please try again!", 'ai');
  } finally {
    // Re-enable send button
    sendBtn.disabled = false;
    userInput.focus();
  }
});

// Enable Enter key to send message
userInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Character counter for input field
userInput.addEventListener('input', (e) => {
  const count = e.target.value.length;
  document.getElementById('charCount').textContent = count;
  
  // Change color when approaching limit
  const charCountEl = document.getElementById('charCount');
  if (count > 180) {
    charCountEl.style.color = 'var(--loreal-red)';
    charCountEl.style.fontWeight = '700';
  } else {
    charCountEl.style.color = '';
    charCountEl.style.fontWeight = '';
  }
});

// Clear chat button functionality
document.getElementById('clearChat').addEventListener('click', () => {
  if (confirm('Start a new conversation? This will clear all messages.')) {
    // Clear chat window
    chatWindow.innerHTML = '';
    // Reset conversation history
    conversationHistory = [];
    // Clear localStorage
    localStorage.removeItem('lorealChatHistory');
    localStorage.removeItem('lorealChatMessages');
    // Reset consultation data
    consultationData = {
      productsRecommended: [],
      concernsDiscussed: [],
      messageCount: 0,
      startTime: null
    };
    // Increment conversation counter
    updateAnalytics('newConversation');
    // Show welcome message and quick replies again
    initializeChat();
  }
});

// ⭐ Get Summary Button functionality
document.getElementById('getSummary').addEventListener('click', () => {
  showConsultationSummary();
});

// Simple analytics tracking
function updateAnalytics(action) {
  const analytics = JSON.parse(localStorage.getItem('lorealAnalytics') || '{}');
  
  if (action === 'newConversation') {
    analytics.totalConversations = (analytics.totalConversations || 0) + 1;
  } else if (action === 'messageSent') {
    analytics.totalMessages = (analytics.totalMessages || 0) + 1;
    const today = new Date().toDateString();
    analytics.lastActive = today;
    analytics.messagesToday = analytics.lastActive === today ? (analytics.messagesToday || 0) + 1 : 1;
  }
  
  localStorage.setItem('lorealAnalytics', JSON.stringify(analytics));
  console.log('📊 Analytics:', analytics);
}

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeChat();
  
  // Load theme preference
  loadThemePreference();
});

// ===== THEME TOGGLE FEATURE =====

// Load theme preference from localStorage
function loadThemePreference() {
  const theme = localStorage.getItem('lorealTheme');
  if (theme === 'dark') {
    document.body.classList.add('dark-mode');
    updateThemeIcon(true);
  }
}

// Toggle between dark and light mode
function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('lorealTheme', isDark ? 'dark' : 'light');
  updateThemeIcon(isDark);
}

// Update theme toggle button icon
function updateThemeIcon(isDark) {
  const themeBtn = document.getElementById('themeToggle');
  const icon = themeBtn.querySelector('.material-icons');
  icon.textContent = isDark ? 'light_mode' : 'dark_mode';
  themeBtn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
}

// Theme toggle button event listener
document.getElementById('themeToggle').addEventListener('click', toggleTheme);

// ===== EXPORT CONVERSATION FEATURE =====

// Export conversation as downloadable text file
function exportConversation() {
  const messages = [];
  const allMessages = chatWindow.querySelectorAll('.msg');
  
  allMessages.forEach(msg => {
    const text = msg.querySelector('.msg-text')?.textContent;
    const sender = msg.classList.contains('user') ? 'You' : 'L\'Oréal Assistant';
    if (text && !msg.querySelector('.quick-replies')) {
      messages.push(`${sender}: ${text}`);
    }
  });
  
  if (messages.length === 0) {
    alert('No conversation to export yet!');
    return;
  }
  
  // Create formatted text content
  const timestamp = new Date().toLocaleString();
  const content = `L'ORÉAL BEAUTY ASSISTANT - CONVERSATION EXPORT
Generated: ${timestamp}
Because You're Worth It! ✨

${'='.repeat(60)}

${messages.join('\n\n')}

${'='.repeat(60)}

Thank you for using L'Oréal Beauty Assistant!
Visit us at: https://www.loreal-paris.com
`;
  
  // Create download link
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loreal-conversation-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // Show success message
  const exportBtn = document.getElementById('exportBtn');
  const icon = exportBtn.querySelector('.material-icons');
  icon.textContent = 'check_circle';
  exportBtn.style.color = 'var(--loreal-red)';
  setTimeout(() => {
    icon.textContent = 'download';
    exportBtn.style.color = '';
  }, 2000);
}

// Export button event listener
document.getElementById('exportBtn').addEventListener('click', exportConversation);

// ===== VOICE INPUT FEATURE =====

// Check if browser supports speech recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isListening = false;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  recognition.onstart = () => {
    isListening = true;
    const voiceBtn = document.getElementById('voiceBtn');
    voiceBtn.classList.add('listening');
    voiceBtn.title = 'Listening... Click to stop';
    const icon = voiceBtn.querySelector('.material-icons');
    icon.textContent = 'mic_off';
    icon.style.color = 'var(--loreal-red)';
  };
  
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    userInput.value = transcript;
    userInput.focus();
    // Optionally auto-submit
    // chatForm.dispatchEvent(new Event('submit'));
  };
  
  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    resetVoiceButton();
    
    if (event.error === 'not-allowed') {
      alert('Microphone access denied. Please enable microphone permissions in your browser settings.');
    } else if (event.error === 'no-speech') {
      alert('No speech detected. Please try again.');
    } else {
      alert(`Voice input error: ${event.error}`);
    }
  };
  
  recognition.onend = () => {
    resetVoiceButton();
  };
}

function resetVoiceButton() {
  isListening = false;
  const voiceBtn = document.getElementById('voiceBtn');
  voiceBtn.classList.remove('listening');
  voiceBtn.title = 'Voice input';
  const icon = voiceBtn.querySelector('.material-icons');
  icon.textContent = 'mic';
  icon.style.color = '';
}

function toggleVoiceInput() {
  if (!recognition) {
    alert('Voice input is not supported in your browser. Please use Chrome, Edge, or Safari.');
    return;
  }
  
  if (isListening) {
    recognition.stop();
  } else {
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      alert('Could not start voice input. Please try again.');
    }
  }
}

// Voice button event listener
document.getElementById('voiceBtn').addEventListener('click', toggleVoiceInput);

/* ========================================
   SPECTACULAR FEATURES 🌟
   ======================================== */

// ⭐ FEATURE 1: Beauty Profile System
let userBeautyProfile = {
  skinType: null,
  hairType: null,
  concerns: [],
  preferences: []
};

// Load beauty profile from localStorage
function loadBeautyProfile() {
  const saved = localStorage.getItem('lorealBeautyProfile');
  if (saved) {
    try {
      userBeautyProfile = JSON.parse(saved);
      console.log('✅ Loaded beauty profile:', userBeautyProfile);
    } catch (e) {
      console.error('Error loading beauty profile:', e);
    }
  }
}

// Save beauty profile to localStorage
function saveBeautyProfile() {
  localStorage.setItem('lorealBeautyProfile', JSON.stringify(userBeautyProfile));
  console.log('💾 Beauty profile saved');
}

// Show beauty profile setup modal
function showBeautyProfileSetup() {
  // Check if profile already exists
  if (userBeautyProfile.skinType && userBeautyProfile.hairType) {
    return; // Profile already set up
  }
  
  const modal = document.createElement('div');
  modal.className = 'beauty-profile-modal';
  modal.innerHTML = `
    <div class="beauty-profile-content">
      <button class="close-modal" onclick="closeBeautyProfile()">&times;</button>
      <h2>✨ Create Your Beauty Profile</h2>
      <p>Help me personalize your experience!</p>
      
      <div class="profile-section">
        <h3>💧 What's your skin type?</h3>
        <div class="profile-options">
          <button class="profile-btn" data-type="skin" data-value="oily">Oily</button>
          <button class="profile-btn" data-type="skin" data-value="dry">Dry</button>
          <button class="profile-btn" data-type="skin" data-value="combination">Combination</button>
          <button class="profile-btn" data-type="skin" data-value="normal">Normal</button>
          <button class="profile-btn" data-type="skin" data-value="sensitive">Sensitive</button>
        </div>
      </div>
      
      <div class="profile-section">
        <h3>💇‍♀️ What's your hair type?</h3>
        <div class="profile-options">
          <button class="profile-btn" data-type="hair" data-value="straight">Straight</button>
          <button class="profile-btn" data-type="hair" data-value="wavy">Wavy</button>
          <button class="profile-btn" data-type="hair" data-value="curly">Curly</button>
          <button class="profile-btn" data-type="hair" data-value="coily">Coily</button>
        </div>
      </div>
      
      <button class="save-profile-btn" onclick="saveProfileAndStart()">Start Chatting ✨</button>
      <button class="skip-profile-btn" onclick="closeBeautyProfile()">Skip for now</button>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Add click handlers for profile buttons
  modal.querySelectorAll('.profile-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const type = this.dataset.type;
      const value = this.dataset.value;
      
      // Remove active class from siblings
      this.parentElement.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
      
      // Add active class to clicked button
      this.classList.add('active');
      
      // Save to profile
      if (type === 'skin') {
        userBeautyProfile.skinType = value;
      } else if (type === 'hair') {
        userBeautyProfile.hairType = value;
      }
    });
  });
}

// Close beauty profile modal
function closeBeautyProfile() {
  const modal = document.querySelector('.beauty-profile-modal');
  if (modal) {
    modal.remove();
  }
}

// Save profile and start chatting
function saveProfileAndStart() {
  if (!userBeautyProfile.skinType || !userBeautyProfile.hairType) {
    alert('Please select both skin type and hair type to continue!');
    return;
  }
  
  saveBeautyProfile();
  closeBeautyProfile();
  
  // Send welcome message with profile info
  const profileMsg = `Great! I've saved your profile (${userBeautyProfile.skinType} skin, ${userBeautyProfile.hairType} hair). I'll use this to personalize my recommendations for you! How can I help you today?`;
  displayMessage(profileMsg, 'ai');
}

// ⭐ FEATURE 2: Share to Social Media
function createShareButton(messageText) {
  const shareBtn = document.createElement('button');
  shareBtn.className = 'share-btn';
  shareBtn.innerHTML = '<span class="material-icons">share</span> Share';
  shareBtn.title = 'Share this beauty tip';
  
  shareBtn.addEventListener('click', async () => {
    const shareText = `L'Oréal Beauty Tip: ${messageText}\n\nGet personalized beauty advice at: ${window.location.href}\n\n#LOrealParis #BeautyTips #BecauseYoureWorthIt`;
    
    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'L\'Oréal Beauty Tip',
          text: shareText,
          url: window.location.href
        });
        console.log('✅ Shared successfully');
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.log('Share cancelled or failed:', err);
        }
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        alert('✅ Beauty tip copied to clipboard! Share it on your favorite platform.');
      } catch (err) {
        // Final fallback: Show text in alert
        alert('Share this beauty tip:\n\n' + shareText);
      }
    }
  });
  
  return shareBtn;
}

// ⭐ FEATURE 3: Enhanced Product Card Display
function enhanceProductMentions(text) {
  // Detect product categories and create visual cards
  const productKeywords = {
    'serum': { emoji: '💧', category: 'Skincare', color: '#4A90E2' },
    'moisturizer': { emoji: '💆‍♀️', category: 'Skincare', color: '#4A90E2' },
    'lipstick': { emoji: '💄', category: 'Makeup', color: '#E4002B' },
    'mascara': { emoji: '👁️', category: 'Makeup', color: '#000000' },
    'foundation': { emoji: '✨', category: 'Makeup', color: '#E4002B' },
    'shampoo': { emoji: '🧴', category: 'Haircare', color: '#8E44AD' },
    'conditioner': { emoji: '💇‍♀️', category: 'Haircare', color: '#8E44AD' },
    'perfume': { emoji: '🌸', category: 'Fragrance', color: '#FF69B4' },
    'cleanser': { emoji: '🧼', category: 'Skincare', color: '#4A90E2' },
    'sunscreen': { emoji: '☀️', category: 'Skincare', color: '#FFA500' }
  };
  
  let enhanced = text;
  let productsFound = [];
  
  // Find products mentioned
  for (const [product, info] of Object.entries(productKeywords)) {
    if (text.toLowerCase().includes(product)) {
      productsFound.push({ product, ...info });
    }
  }
  
  // If products found, add visual cards
  if (productsFound.length > 0) {
    const cards = productsFound.map(p => `
      <div class="product-card" style="border-left: 4px solid ${p.color}">
        <span class="product-emoji">${p.emoji}</span>
        <div class="product-info">
          <span class="product-category">${p.category}</span>
          <span class="product-name">${p.product.charAt(0).toUpperCase() + p.product.slice(1)}</span>
        </div>
      </div>
    `).join('');
    
    enhanced += `<div class="product-showcase">${cards}</div>`;
  }
  
  return enhanced;
}

// ⭐ FEATURE 2: Add Product Recommendation Scores
function addRecommendationScores(text) {
  // Only add scores if user has a beauty profile
  if (!userBeautyProfile.skinType && !userBeautyProfile.hairType) {
    return text;
  }
  
  // Product keywords that would benefit from scores
  const scorableProducts = [
    'serum', 'moisturizer', 'cleanser', 'cream', 'toner', 'sunscreen',
    'foundation', 'lipstick', 'mascara', 'eyeshadow',
    'shampoo', 'conditioner', 'treatment', 'hair mask'
  ];
  
  let enhanced = text;
  
  // Check if any scorable products are mentioned
  for (const product of scorableProducts) {
    const regex = new RegExp(`\\b${product}\\b`, 'gi');
    if (regex.test(text)) {
      // Generate a score based on context (simplified - in real app would use AI analysis)
      const score = generateProductScore(product, text);
      const stars = '⭐'.repeat(score);
      const scoreTag = `<span class="recommendation-score" title="Recommended for your ${userBeautyProfile.skinType || userBeautyProfile.hairType} profile">${stars}</span>`;
      
      // Add score after first mention of product
      enhanced = enhanced.replace(regex, (match) => {
        return `${match} ${scoreTag}`;
      });
      
      break; // Only add one score per message to avoid clutter
    }
  }
  
  return enhanced;
}

// Generate product score based on user profile and context
function generateProductScore(product, context) {
  const contextLower = context.toLowerCase();
  
  // Simple scoring logic - in production would use more sophisticated analysis
  if (userBeautyProfile.skinType === 'oily' && 
      (contextLower.includes('oil-free') || contextLower.includes('mattifying'))) {
    return 5;
  } else if (userBeautyProfile.skinType === 'dry' && 
             (contextLower.includes('hydrating') || contextLower.includes('moisturizing'))) {
    return 5;
  } else if (contextLower.includes('highly recommend') || contextLower.includes('perfect for')) {
    return 5;
  } else if (contextLower.includes('great') || contextLower.includes('excellent')) {
    return 4;
  } else {
    return 4; // Default good rating
  }
}

// ⭐ FEATURE 3: Consultation Summary Generator
let consultationData = {
  productsRecommended: [],
  concernsDiscussed: [],
  messageCount: 0,
  startTime: null
};

// Track consultation data
function trackConsultationData(message, sender) {
  // Initialize start time
  if (!consultationData.startTime) {
    consultationData.startTime = new Date();
  }
  
  // Increment message count
  consultationData.messageCount++;
  
  if (sender === 'ai') {
    const messageLower = message.toLowerCase();
    
    // Track products mentioned
    const products = ['serum', 'moisturizer', 'cleanser', 'foundation', 'lipstick', 
                     'mascara', 'shampoo', 'conditioner', 'perfume', 'sunscreen'];
    products.forEach(product => {
      if (messageLower.includes(product) && !consultationData.productsRecommended.includes(product)) {
        consultationData.productsRecommended.push(product);
      }
    });
    
    // Track concerns discussed
    const concerns = ['acne', 'wrinkles', 'aging', 'dark spots', 'dryness', 'oily', 
                     'sensitive', 'dull', 'uneven', 'redness', 'frizz', 'damage'];
    concerns.forEach(concern => {
      if (messageLower.includes(concern) && !consultationData.concernsDiscussed.includes(concern)) {
        consultationData.concernsDiscussed.push(concern);
      }
    });
  }
}

// Generate consultation summary
function generateConsultationSummary() {
  const duration = consultationData.startTime ? 
    Math.round((new Date() - consultationData.startTime) / 60000) : 0; // minutes
  
  const summary = `
    <div class="consultation-summary">
      <h3>✨ Your L'Oréal Beauty Consultation Summary</h3>
      
      <div class="summary-section">
        <h4>👤 Your Profile</h4>
        <p><strong>Skin Type:</strong> ${userBeautyProfile.skinType || 'Not specified'}</p>
        <p><strong>Hair Type:</strong> ${userBeautyProfile.hairType || 'Not specified'}</p>
      </div>
      
      <div class="summary-section">
        <h4>💬 Consultation Stats</h4>
        <p><strong>Duration:</strong> ${duration} minute${duration !== 1 ? 's' : ''}</p>
        <p><strong>Messages Exchanged:</strong> ${consultationData.messageCount}</p>
      </div>
      
      ${consultationData.concernsDiscussed.length > 0 ? `
        <div class="summary-section">
          <h4>🎯 Concerns Addressed</h4>
          <div class="concern-tags">
            ${consultationData.concernsDiscussed.map(c => 
              `<span class="concern-tag">${c}</span>`
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      ${consultationData.productsRecommended.length > 0 ? `
        <div class="summary-section">
          <h4>🛍️ Products Recommended</h4>
          <div class="product-tags">
            ${consultationData.productsRecommended.map(p => 
              `<span class="product-tag">${p.charAt(0).toUpperCase() + p.slice(1)}</span>`
            ).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="summary-footer">
        <p><em>Because You're Worth It! ✨</em></p>
        <button class="download-summary-btn" onclick="downloadSummary()">
          <span class="material-icons">download</span> Download Summary
        </button>
      </div>
    </div>
  `;
  
  return summary;
}

// Show consultation summary
function showConsultationSummary() {
  // Only show if we have meaningful data
  if (consultationData.messageCount < 4) {
    return;
  }
  
  const summaryHTML = generateConsultationSummary();
  displayMessage(summaryHTML, 'ai', false);
}

// Download summary as text
function downloadSummary() {
  const summaryText = `
L'ORÉAL BEAUTY CONSULTATION SUMMARY
===================================

YOUR PROFILE:
Skin Type: ${userBeautyProfile.skinType || 'Not specified'}
Hair Type: ${userBeautyProfile.hairType || 'Not specified'}

CONSULTATION STATS:
Messages Exchanged: ${consultationData.messageCount}
${consultationData.concernsDiscussed.length > 0 ? `
CONCERNS ADDRESSED:
${consultationData.concernsDiscussed.map(c => `- ${c}`).join('\n')}
` : ''}
${consultationData.productsRecommended.length > 0 ? `
PRODUCTS RECOMMENDED:
${consultationData.productsRecommended.map(p => `- ${p.charAt(0).toUpperCase() + p.slice(1)}`).join('\n')}
` : ''}

Thank you for consulting with L'Oréal Beauty Assistant!
Because You're Worth It! ✨

Visit: ${window.location.href}
  `.trim();
  
  // Create downloadable text file
  const blob = new Blob([summaryText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `loreal-consultation-${new Date().toISOString().split('T')[0]}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Initialize spectacular features on page load
window.addEventListener('DOMContentLoaded', () => {
  loadBeautyProfile();
  
  // Show beauty profile setup after a short delay if no profile exists
  setTimeout(() => {
    if (!userBeautyProfile.skinType || !userBeautyProfile.hairType) {
      showBeautyProfileSetup();
    }
  }, 2000);
});
