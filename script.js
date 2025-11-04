/* DOM elements */
const chatForm = document.getElementById("chatForm");
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
  messageDiv.textContent = message;
  chatWindow.appendChild(messageDiv);
  
  // Scroll to bottom
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Show loading indicator
function showLoading() {
  const loadingDiv = document.createElement('div');
  loadingDiv.classList.add('msg', 'ai');
  loadingDiv.innerHTML = '<span class="loading"></span> Thinking...';
  loadingDiv.id = 'loading-message';
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

    // Replace with your actual Cloudflare Worker URL
    const cloudflareWorkerUrl = 'YOUR_CLOUDFLARE_WORKER_URL_HERE';
    
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
    
    // Keep conversation history manageable (last 10 exchanges)
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

// Initialize chat when page loads
document.addEventListener('DOMContentLoaded', initializeChat);
