# 🔮💈 Yahir Cutz - Public (Frontend)

**PRIVATE PROJECT** - Yahir Cutz Booking System

Sistema de reservas online para Yahir Cutz en Los Magicos Barbershop, Carolina, Puerto Rico.

---

## 🚀 Deploy to GitHub Pages (Private Repository)

This is your **frontend** folder for Yahir Cutz. 

### ⚠️ IMPORTANT: Keep Repository PRIVATE
1. Go to repository **Settings** → **General**
2. Under "Danger Zone", set as **Private** repository
3. Only add collaborators you trust

### Quick Deploy (from public/ folder)
```bash
cd public
git init
git add .
git commit -m "Initial Yahir Cutz frontend"
git branch -M main
git remote add origin https://github.com/your-username/yahircutz-private.git
git push -u origin main
```

Then:
1. Go to repository **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → folder: **/ (root)**
4. Click **Save**
5. Set to **Private** so only you can access it

## ⚙️ Configuration

API URL is auto-configured in [js/config.js](js/config.js):

```javascript
// Development: http://localhost:3000
// Production: https://tu-aws-backend.com (UPDATE THIS!)
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://tu-aws-backend.com'; // ⚠️ CHANGE TO YOUR AWS SERVER
```

**Before deploying to production**, update the AWS backend URL in [js/config.js](js/config.js).

## 📋 Features

- ✂️ 4-step booking system
- 📅 Interactive calendar with availability
- 🕐 12-hour time format (AM/PM)
- 📱 Progressive Web App (PWA)
- 🎨 Red & dark theme
- 📸 Service gallery
- 💬 WhatsApp & Instagram integration

## 🛠️ Tech Stack

- HTML5
- CSS3 (CSS Variables)
- Vanilla JavaScript
- PWA (manifest + service worker)

## 🧪 Local Testing

```bash
# Using Python
python -m http.server 8080

# Using Node
npx serve -p 8080
```

Visit: `http://localhost:8080`

## 📱 PWA Installation

Users can install as an app on:
- iOS: Share → Add to Home Screen
- Android: Menu → Install App
- Desktop: Address bar → Install icon

## 🌐 Live Site

Once deployed: `https://your-username.github.io/yahircutz/`

---

**Need backend?** See [DEPLOYMENT.md](../DEPLOYMENT.md) in root folder.
