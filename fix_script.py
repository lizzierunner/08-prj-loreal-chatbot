# Read script-local.js  
with open('script-local.js', 'r') as f:
    content = f.read()

# Find and replace the sendToOpenAI function
import re

pattern = r'//\s*Send message to OpenAI.*?catch\s*\(error\)\s*{[^}]+}'
replacement = '''// Send message to OpenAI API via Cloudflare Worker
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
  }'''

new_content = re.sub(pattern, replacement, content, flags=re.DOTALL)
with open('script.js', 'w') as f:
    f.write(new_content)
print("Done")
