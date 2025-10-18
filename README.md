## 🎵 Igloo.DJ - Watch Videos with Friends

A web application to watch YouTube videos in sync with friends, featuring shared queue, virtual disco, and chat. Built with Node.js, Express, and Socket.io.

---

<p align="center">
   <img src="img/IglooParty.png" alt="README IMAGE" width="400" heigth="250">
</p>

---

## ✨ Features

- 📺 **Synchronized YouTube player** - Everyone watches the same video at the same time
- 🎵 **Shared video queue** - Add videos and they play in order
- 🎧 **DJ role** - First user becomes DJ with special controls
- 🕺 **Virtual disco** - Customizable pixel art avatars that move around
- 💬 **Real-time chat** - Talk with friends while watching
- 🎨 **Pixel art editor** - Create your own avatar with the built-in editor
- 🖼️ **GIF support** - Use animated GIFs as avatars
- 🌓 **Dark/light mode** - Choose your preferred theme
- 🌍 **Spanish/English** - Bilingual interface

## 🎮 How to Use

### DJ Controls
The DJ (first user to join) has special powers:
- Skip videos
- Remove videos from queue
- Sync playback for all users
- Transfer DJ role to another user (click on them)

### Regular Users
Everyone can:
- Add videos to the queue (paste YouTube URL)
- Enter the disco and create an avatar
- Chat with other users
- Move around the disco (drag your avatar)
- Use emotes (keys 1-5)

## 🛠️ Local Installation

```bash
# Install dependencies
npm install

# Run server
npm start

# Open in browser
http://localhost:3000
```

## 🔧 Technologies

- **Node.js** - Server runtime
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **YouTube Iframe API** - Video player integration

## 📝 How It Works

1. The first user to connect automatically becomes the DJ
2. DJ adds videos to the queue or any user can add videos
3. Videos play in order, synchronized for everyone
4. Users can join the disco (optional) and interact with avatars
5. Chat is always available for communication
6. DJ can transfer their role by clicking another user's name

---

## 🌐 Deployment (Optional)

Want to share with friends online? Here are some options:

### Option 1: Render (Free, Recommended) ⭐

1. Create account at https://render.com
2. Upload your code to GitHub
3. Create a "Web Service" on Render:
   - **Name**: igloo-dj (or whatever you want)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Render gives you a URL to share

**Note**: Free plan sleeps after 15 min of inactivity (~30 sec to wake up).

### Option 2: ngrok (Quick Testing) ⚡

**Temporary solution** - URL changes every time:

```bash
# Terminal 1: Run your server
npm start

# Terminal 2: Expose with ngrok
ngrok http 3000
```

Share the ngrok URL with friends (expires when closed).
