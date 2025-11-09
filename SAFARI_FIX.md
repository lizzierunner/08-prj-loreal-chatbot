# 🦁 Safari Local Testing Fix

## Problem
Safari shows error: "API key not found. Make sure secrets.js is loaded"

This happens because Safari blocks local file loading for security reasons when opening HTML files directly.

---

## ✅ Solution 1: Use a Local Server (RECOMMENDED)

Safari requires files to be served through HTTP/HTTPS, not opened directly from the file system.

### Option A: Python (Built-in on Mac)

```bash
# Navigate to your project folder
cd "/Users/lizziejohnson/Desktop/last-drop-charity-run/Nasa/Untitled/Nasa-app-project/Nasa Project/09-nasa-space-explorer-v2/08-prj-loreal-chatbot"

# Start a simple web server (Python 3)
python3 -m http.server 8000

# Or if you have Python 2:
python -m SimpleHTTPServer 8000
```

Then open Safari and go to: **http://localhost:8000**

### Option B: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click `index.html`
3. Select "Open with Live Server"
4. Opens automatically in your default browser

### Option C: PHP (Built-in on Mac)

```bash
# Navigate to project folder
cd "/Users/lizziejohnson/Desktop/last-drop-charity-run/Nasa/Untitled/Nasa-app-project/Nasa Project/09-nasa-space-explorer-v2/08-prj-loreal-chatbot"

# Start PHP server
php -S localhost:8000
```

Then open Safari and go to: **http://localhost:8000**

---

## ✅ Solution 2: Use Chrome or Firefox Instead

For local file testing, Chrome and Firefox are more permissive:

1. **Chrome**: Open `index.html` directly - should work fine
2. **Firefox**: Open `index.html` directly - should work fine

Safari is the most strict about local file security.

---

## ✅ Solution 3: Change Safari Settings (Not Recommended)

You can disable Safari's local file restrictions, but this is a security risk:

1. Open Safari
2. Safari → Settings → Advanced
3. Check "Show Develop menu in menu bar"
4. Develop → Disable Local File Restrictions

**⚠️ Warning**: This reduces security. Only do this temporarily for testing!

---

## ✅ Solution 4: Embed API Key Directly (Testing Only)

**⚠️ NEVER commit this to GitHub!**

For quick Safari testing, you can temporarily embed the key:

1. Open `script-local.js`
2. Find line with `if (!OPENAI_API_KEY) {`
3. Add this BEFORE that check:

```javascript
// TEMPORARY - Remove before committing!
const OPENAI_API_KEY = 'your-api-key-here';
```

**Remember**: Delete this line before committing to GitHub!

---

## 🎯 Best Practice for Development

**For Local Testing:**
```
Use: Python/PHP server → Safari works perfectly ✅
```

**For Production:**
```
Use: Cloudflare Worker → API key never exposed ✅
```

---

## 🚀 Quick Start (Copy-Paste Ready)

```bash
# Open Terminal
# Navigate to your project
cd "/Users/lizziejohnson/Desktop/last-drop-charity-run/Nasa/Untitled/Nasa-app-project/Nasa Project/09-nasa-space-explorer-v2/08-prj-loreal-chatbot"

# Start Python server
python3 -m http.server 8000

# Open Safari to http://localhost:8000
# Should work perfectly! ✨
```

---

## ✅ Verification

Once server is running, you should see:
1. ✅ Safari loads the page
2. ✅ Console shows: "🔒 API key loaded from secrets.js"
3. ✅ Quick reply buttons work
4. ✅ Chatbot responds to questions

---

**Because You're Worth It!** 💄✨
