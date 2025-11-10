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

I'm here to help you discover the perfect beauty products and routines. Whether you're looking for:

💄 Makeup recommendations
🧴 Skincare routines  
💇‍♀️ Haircare solutions
🌸 Fragrance suggestions

Just ask me anything about beauty, and I'll provide personalized L'Oréal product recommendations!

What can I help you with today?`;

    displayMessage(welcomeMessage, 'ai');
    
    // Show quick reply buttons to help users get started
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
}

// Display message in chat window
function displayMessage(message, sender, shouldSave = true) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('msg', sender);
  
  // Create text content with smart product links
  const textSpan = document.createElement('span');
  textSpan.classList.add('msg-text');
  
  // Add smart product links for AI messages
  if (sender === 'ai') {
    textSpan.innerHTML = addProductLinks(message);
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
  }
  
  chatWindow.appendChild(messageDiv);
  
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
    // Increment conversation counter
    updateAnalytics('newConversation');
    // Show welcome message and quick replies again
    initializeChat();
  }
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
