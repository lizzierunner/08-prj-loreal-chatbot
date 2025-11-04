# L'Oréal Beauty Assistant - Setup Guide

## 🎯 Quick Start Options

### Option 1: Demo Mode (Current Setup)
Perfect for testing the interface and design without API keys.

**What's included:**
- ✅ Full L'Oréal branding and styling
- ✅ Interactive chat interface
- ✅ Pre-written demo responses
- ✅ Loading animations and transitions

**Files in use:**
- `index.html` (links to `script-demo.js`)
- `script-demo.js` (demo responses)
- `style.css` (L'Oréal styling)

### Option 2: Full AI Integration
For production use with real OpenAI API responses.

**Setup steps:**

1. **Get OpenAI API Key**
   - Sign up at [OpenAI](https://platform.openai.com/)
   - Create an API key in your dashboard

2. **Set up Cloudflare Worker**
   - Go to [Cloudflare Workers](https://workers.cloudflare.com/)
   - Create a new worker
   - Copy code from `RESOURCE_cloudflare-worker.js`
   - Add `OPENAI_API_KEY` as an environment variable

3. **Update Frontend**
   - In `script.js`, replace `YOUR_CLOUDFLARE_WORKER_URL_HERE` with your worker URL
   - In `index.html`, change:
     ```html
     <!-- FROM: -->
     <script src="script-demo.js"></script>
     <!-- <script src="script.js"></script> -->
     
     <!-- TO: -->
     <!-- <script src="script-demo.js"></script> -->
     <script src="script.js"></script>
     ```

4. **Remove Demo Files** (optional)
   - Delete `script-demo.js`
   - Remove `secrets.js` script tag from `index.html`

## 🔄 Switching Between Modes

### Demo → Production
1. Update `index.html` script tags (see step 3 above)
2. Configure your Cloudflare Worker URL in `script.js`
3. Deploy to your hosting platform

### Production → Demo
1. Change script tags back to `script-demo.js`
2. Refresh your browser

## 🎨 Customization

### Brand Colors (in `style.css`)
```css
:root {
  --loreal-black: #000000;
  --loreal-gold: #D4AF37;
  --loreal-light-gold: #F4E4BC;
  /* Modify these to match your brand */
}
```

### Chat Responses (in `script.js`)
Update the `systemPrompt` variable to customize the AI's personality and knowledge base.

## 🚀 Deployment Options

1. **GitHub Pages** (demo mode only)
2. **Netlify/Vercel** (demo mode or with Cloudflare Worker)
3. **Cloudflare Pages** (recommended for full integration)

## 🔧 Troubleshooting

**Issue**: "CORS error when calling API"
**Solution**: Make sure your Cloudflare Worker includes proper CORS headers

**Issue**: "Chat not responding"
**Solution**: Check browser console for errors, verify Cloudflare Worker URL

**Issue**: "Styling looks wrong"
**Solution**: Ensure all CSS custom properties are defined in `:root`

## 📞 Support

For questions about this implementation, check:
- OpenAI API documentation
- Cloudflare Workers documentation  
- Browser developer console for errors

Happy coding! ✨
