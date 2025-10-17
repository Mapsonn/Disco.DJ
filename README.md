# 🎵 Plug.DJ Clone - Watch Videos with Friends

A web application to watch YouTube videos in sync with friends, featuring shared queue, virtual disco, and chat.

## 🌐 Deploy to the Internet

### Option 1: Render (Free, Recommended) ⭐

1. **Create Render account**
   - Go to https://render.com
   - Sign up with GitHub/Google

2. **Upload code to GitHub**
   ```bash
   cd "F:\CODING\Proyectosd\Plug.dj"
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on GitHub and follow the instructions
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

3. **Create Web Service on Render**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configuration:
     - **Name**: plug-dj-clone (or whatever you want)
     - **Environment**: Node
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free
   - Click "Create Web Service"

4. **Done!** 🎉
   - Render will give you a URL like: `https://your-app.onrender.com`
   - Share that link with your friends

**Note**: On the free plan, the app "sleeps" after 15 min of inactivity and takes ~30 sec to wake up.

---

### Option 2: Railway (Free with $5 credit) 🚂

1. **Create account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Deploy**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect it's Node.js
   - Auto deploy! 🚀

3. **Get URL**
   - Go to "Settings" → "Domains"
   - Click "Generate Domain"
   - Share the URL with your friends

---

### Option 3: ngrok (For Quick Testing Only) ⚡

**WARNING**: This option is temporary, the URL changes every time.

1. **Install ngrok**
   - Download from https://ngrok.com/download
   - Extract and put `ngrok.exe` in a folder

2. **Run your server locally**
   ```bash
   cd "F:\CODING\Proyectosd\Plug.dj"
   npm install
   node server.js
   ```

3. **In another terminal, run ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Share URL**
   - ngrok will give you a URL like: `https://xxxx-xx-xx-xx-xx.ngrok.io`
   - Share that URL with your friends
   - **The URL expires when you close ngrok**

---

## 🛠️ Local Installation

```bash
# Install dependencies
npm install

# Run server
npm start

# Open in browser
http://localhost:3000
```

## ✨ Features

- 📺 Synchronized YouTube player
- 🎵 Shared video queue
- 🎧 DJ role (first to enter)
- 🕺 Virtual disco with custom avatars
- 💬 Local chat
- 🎨 Pixel art editor
- 🖼️ GIF support
- 🌓 Dark/light mode
- 🌍 Spanish/English

## 🎮 Controls

- **DJ**: Can skip videos, remove from queue, sync playback
- **Everyone**: Can add videos, enter the disco, chat
- **Disco**: Drag your character with the mouse, emotes with keys 1-5

## 🔧 Technologies

- Node.js
- Express
- Socket.io
- YouTube Iframe API

## 📝 Notes

- The first user automatically becomes DJ
- The DJ can transfer their role by clicking on another user
- Videos play in queue order
- The disco is optional and visual
