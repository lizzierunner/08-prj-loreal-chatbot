/* DOM elements */
const chatForm = doc// Initialize chat with welcome message
function initializeChat() {
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
}yId("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Chat history to maintain conversation context
let conversationHistory = [];

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
  const welcomeMessage = `✨ Welcome to L'Oréal Beauty Assistant! ✨

I'm here to help you discover the perfect beauty products and routines. Whether you're looking for:

💄 Makeup recommendations
🧴 Skincare routines  
�‍♀️ Haircare solutions
🌸 Fragrance suggestions

Just ask me anything about beauty, and I'll provide personalized L'Oréal product recommendations!

What can I help you with today?`;

  displayMessage(welcomeMessage, 'ai');
}

// Display message in chat window
function displayMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('msg', sender);
  
  // Create text content
  const textSpan = document.createElement('span');
  textSpan.classList.add('msg-text');
  textSpan.textContent = message;
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
async function sendToAPI(userMessage) {
  try {
    // Add user message to conversation history
    conversationHistory.push({ role: "user", content: userMessage });
    
    // Prepare messages array with system prompt and conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory
    ];

    // ✅ Cloudflare Worker URL - Deployed and Ready!
    const cloudflareWorkerUrl = 'https://loreal-chatbot2.esjohn15.workers.dev/';
    
    // Send request to Cloudflare Worker (which will proxy to OpenAI)
    const response = await fetch(cloudflareWorkerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: messages })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract AI response from OpenAI API response
    const aiResponse = data.choices[0].message.content;
    
    // Add AI response to conversation history
    conversationHistory.push({ role: "assistant", content: aiResponse });
    
    // Keep conversation history manageable (last 10 exchanges = 20 messages)
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    return aiResponse;
    
  } catch (error) {
    console.error('Error calling API:', error);
    return "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or contact L'Oréal customer service for immediate assistance. Because You're Worth It! ✨";
  }
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const message = userInput.value.trim();
  if (!message) return;
  
  // Display user message
  displayMessage(message, 'user');
  
  // Clear input and disable send button
  userInput.value = '';
  sendBtn.disabled = true;
  
  // Show loading indicator
  showLoading();
  
  try {
    // Get AI response
    const aiResponse = await sendToAPI(message);
    
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
    // Show welcome message and quick replies again
    initializeChat();
  }
});

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', initializeChat);
