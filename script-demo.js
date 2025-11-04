/* Demo version of script.js for testing without API key */
/* Replace this with the full script.js when you have your Cloudflare Worker set up */

/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

// Demo responses for testing the interface
const demoResponses = [
  "✨ I'd love to help you find the perfect L'Oréal products! For makeup, I recommend starting with our Infallible line for long-lasting coverage. What specific look are you going for?",
  "🌟 For skincare, L'Oréal's RevitaLift collection is amazing for anti-aging! The routine includes a gentle cleanser, vitamin C serum, and moisturizer with SPF. What's your skin type?",
  "💄 Our True Match foundation is perfect for finding your exact shade! It comes in 45 different tones. Have you tried our shade matching tool? Because You're Worth It!",
  "🧴 For haircare, L'Oréal Elvive has solutions for every hair type! The Extraordinary Oil line is great for dry hair, while Total Repair works wonders on damaged strands.",
  "🌸 L'Oréal fragrances like La Vie Est Belle are timeless classics! For something fresh and modern, try our newer Libre collection. What scent family do you prefer?",
  "✨ I can help you create a complete beauty routine! Let's start with your main concerns - are you looking for everyday wear or special occasion glamour?",
  "I'm here specifically to help with L'Oréal beauty products and routines. Is there anything about makeup, skincare, haircare, or fragrances I can help you with today? Because You're Worth It! ✨"
];

let responseIndex = 0;

// Initialize chat with welcome message
function initializeChat() {
  const welcomeMessage = `✨ Welcome to L'Oréal Beauty Assistant! ✨

I'm here to help you discover the perfect beauty products and routines. Whether you're looking for:

💄 Makeup recommendations
🧴 Skincare routines  
💇‍♀️ Haircare solutions
🌸 Fragrance suggestions

Just ask me anything about beauty, and I'll provide personalized L'Oréal product recommendations!

What can I help you with today?

🚧 DEMO MODE: This is a demonstration version. To enable full AI responses, set up your Cloudflare Worker with OpenAI API integration.`;

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

// Demo function that simulates AI response
async function getDemoResponse() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const response = demoResponses[responseIndex % demoResponses.length];
      responseIndex++;
      resolve(response);
    }, 1500); // Simulate network delay
  });
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
    // Get demo response (replace with real API call)
    const aiResponse = await getDemoResponse();
    
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
