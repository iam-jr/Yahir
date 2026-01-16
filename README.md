# 🔮💈 Yahir Cutz - Frontend

Sistema de reservas online para Yahir Cutz en Los Magicos Barbershop, Carolina, Puerto Rico.

## 🚀 Deploy to GitHub Pages

This folder contains the static frontend ready for GitHub Pages deployment.

### Quick Deploy
```bash
git init
git add .
git commit -m "Deploy YahirCutz"
git branch -M main
git remote add origin https://github.com/your-username/yahircutz.git
git push -u origin main
```

Then enable GitHub Pages in repository settings.

## ⚙️ Configuration

**IMPORTANT:** Before deploying, update [js/config.js](js/config.js):

```javascript
const API_BASE_URL = 'https://your-backend-server.com'; // Change this!
```

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
