# 🚀 Quick Deployment Checklist

**Goal:** Make GitHub Pages work for your instructor

## ✅ Deployment Steps

### 1. Create Cloudflare Worker ✓
- Go to: https://dash.cloudflare.com/sign-up
- Create account (free)
- Navigate to Workers & Pages
- Create new Worker
- Name: `loreal-chatbot`

### 2. Add Worker Code ✓
- Click "Edit Code"
- Delete default code
- Paste code from `RESOURCE_cloudflare-worker.js`
- Click "Save and Deploy"

### 3. Set API Key ✓
- Go to Settings → Variables
- Add variable: `OPENAI_API_KEY`
- Paste your OpenAI API key
- Set as "Encrypt" or "Secret"
- Click Deploy

### 4. Copy Worker URL ✓
Your URL looks like:
```
https://loreal-chatbot.YOUR-NAME.workers.dev/
```

### 5. Update script.js ✓
Replace line 260 in `script.js`:
```javascript
// OLD:
const cloudflareWorkerUrl = 'https://loreal-chatbot2.esjohn15.workers.dev/';

// NEW (use YOUR URL):
const cloudflareWorkerUrl = 'https://YOUR-WORKER-URL.workers.dev/';
```

### 6. Commit and Push ✓
```bash
git add script.js
git commit -m "Update Cloudflare Worker URL for production"
git push origin main
```

### 7. Wait & Test ✓
- Wait 1-2 minutes for GitHub Pages to rebuild
- Visit: https://lizzierunner.github.io/08-prj-loreal-chatbot/
- Test chatbot - should work!

## 📞 Tell Me Your Worker URL

Once you have your Cloudflare Worker URL, tell me and I'll update script.js for you!

Example: "My worker URL is https://loreal-chatbot.myname123.workers.dev/"

Then I'll:
1. Update script.js with your URL
2. Commit the change
3. Push to GitHub
4. Your GitHub Pages will work!

## ⏱️ Total Time: ~15 minutes

You got this! 💪
