const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// Structure to store rooms
const rooms = new Map();

// Room structure
class Room {
  constructor(roomId) {
    this.id = roomId;
    this.users = new Map();
    this.queue = [];
    this.currentVideo = null;
    this.currentVideoStartTime = null;
    this.isPlaying = false;
    this.discoUsers = new Map(); // Users in disco with avatars and positions
    this.djSocketId = null; // Current DJ ID
    this.syncTime = 0; // Synced video time
  }

  addUser(socketId, username) {
    // First user is DJ
    const isDJ = this.users.size === 0;
    this.users.set(socketId, { id: socketId, username, isDJ });
    
    // If DJ, save it
    if (isDJ) {
      this.djSocketId = socketId;
    }
  }

  removeUser(socketId) {
    this.users.delete(socketId);
    this.discoUsers.delete(socketId);
    
    // If DJ disconnects, assign new DJ
    if (socketId === this.djSocketId && this.users.size > 0) {
      const newDJ = Array.from(this.users.keys())[0];
      const user = this.users.get(newDJ);
      if (user) {
        user.isDJ = true;
        this.djSocketId = newDJ;
      }
    }
  }

  getUsers() {
    return Array.from(this.users.values());
  }
  
  getDJSocketId() {
    return this.djSocketId;
  }
  
  isDJUser(socketId) {
    const user = this.users.get(socketId);
    return user ? user.isDJ : false;
  }
  
  transferDJ(fromSocketId, toSocketId) {
    // Remove DJ from current user
    const fromUser = this.users.get(fromSocketId);
    if (fromUser) {
      fromUser.isDJ = false;
    }
    
    // Assign DJ to new user
    const toUser = this.users.get(toSocketId);
    if (toUser) {
      toUser.isDJ = true;
      this.djSocketId = toSocketId;
      return true;
    }
    return false;
  }
  
  addDiscoUser(socketId, username, avatar, x, y) {
    this.discoUsers.set(socketId, { socketId, username, avatar, x, y });
  }
  
  updateDiscoUserPosition(socketId, x, y) {
    const user = this.discoUsers.get(socketId);
    if (user) {
      user.x = x;
      user.y = y;
    }
  }
  
  getDiscoUsers() {
    return Array.from(this.discoUsers.values());
  }

  addToQueue(video) {
    this.queue.push(video);
  }

  removeFromQueue(videoId) {
    this.queue = this.queue.filter(v => v.id !== videoId);
  }

  nextVideo() {
    if (this.queue.length > 0) {
      this.currentVideo = this.queue.shift();
      this.currentVideoStartTime = Date.now();
      this.isPlaying = true;
      return this.currentVideo;
    }
    this.currentVideo = null;
    this.isPlaying = false;
    return null;
  }
}

// Function to get or create a room
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Room(roomId));
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  let currentRoom = null;

  // Join a room
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    currentRoom = roomId;
    
    socket.join(roomId);
    const room = getOrCreateRoom(roomId);
    room.addUser(socket.id, username);

    console.log(`${username} joined room ${roomId}`);

    const user = room.users.get(socket.id);
    const isDJ = user ? user.isDJ : false;

    // Send current room state to joining user
    socket.emit('room-state', {
      users: room.getUsers(),
      queue: room.queue,
      currentVideo: room.currentVideo,
      currentVideoStartTime: room.currentVideoStartTime,
      isPlaying: room.isPlaying,
      isDJ: isDJ,
      djSocketId: room.getDJSocketId(),
      syncTime: room.syncTime
    });

    // Notify all users in the room about the new user
    io.to(roomId).emit('user-joined', {
      users: room.getUsers(),
      username: username,
      djSocketId: room.getDJSocketId()
    });
  });

  // Add video to queue
  socket.on('add-video', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);
    
    console.log('📥 Video received from client:', data);
    
    const video = {
      id: data.videoId,
      title: data.title,
      thumbnail: data.thumbnail,
      addedBy: user.username,
      duration: data.duration || 'N/A',
      views: data.views || 'N/A',
      timestamp: Date.now()
    };

    console.log('💾 Video processed:', video);
    console.log('🎬 Current video before adding:', room.currentVideo ? 'YES video' : 'NO video');
    console.log('📋 Queue before adding:', room.queue.length, 'videos');

    room.addToQueue(video);
    console.log('📋 Queue after adding:', room.queue.length, 'videos');

    // If no video playing, start next one
    if (!room.currentVideo) {
      const nextVideo = room.nextVideo();
      console.log('▶️ Starting first video:', nextVideo);
      console.log('📋 Queue after nextVideo():', room.queue.length, 'videos');
      io.to(currentRoom).emit('play-video', {
        video: nextVideo,
        startTime: 0
      });
    } else {
      console.log('✅ Current video exists, only adding to queue');
    }

    // Notify everyone about queue update
    console.log('📤 Sending queue-updated with', room.queue.length, 'videos');
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Video ended
  socket.on('video-ended', () => {
    if (!currentRoom) return;

    console.log('🏁 Video ended, looking for next...');
    const room = rooms.get(currentRoom);
    console.log('📋 Queue before nextVideo():', room.queue.length, 'videos');
    
    const nextVideo = room.nextVideo();
    console.log('📋 Queue after nextVideo():', room.queue.length, 'videos');

    if (nextVideo) {
      console.log('▶️ Playing next video:', nextVideo.title);
      io.to(currentRoom).emit('play-video', {
        video: nextVideo,
        startTime: 0
      });
    } else {
      console.log('❌ No more videos in queue');
      io.to(currentRoom).emit('queue-empty');
    }

    console.log('📤 Sending queue-updated with', room.queue.length, 'videos');
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Remove video from queue (DJ only)
  socket.on('remove-video', (videoId) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verify it's the DJ
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Only the DJ can remove videos' });
      return;
    }
    
    room.removeFromQueue(videoId);

    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Skip current video (DJ only)
  socket.on('skip-video', () => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verify it's the DJ
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Only the DJ can skip videos' });
      return;
    }

    const nextVideo = room.nextVideo();

    if (nextVideo) {
      io.to(currentRoom).emit('play-video', {
        video: nextVideo,
        startTime: 0
      });
    } else {
      room.currentVideo = null;
      room.isPlaying = false;
      io.to(currentRoom).emit('queue-empty');
    }

    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Update video duration
  socket.on('update-video-duration', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Update duration in current video
    if (room.currentVideo && room.currentVideo.id === data.videoId) {
      room.currentVideo.duration = data.duration;
    }
    
    // Update duration in queue
    room.queue.forEach(video => {
      if (video.id === data.videoId) {
        video.duration = data.duration;
      }
    });

    // Notify everyone
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Reorder queue (DJ only)
  socket.on('reorder-queue', (data) => {
    if (!currentRoom) {
      console.error('❌ reorder-queue: No current room');
      return;
    }

    const room = rooms.get(currentRoom);
    
    // Verify it's the DJ
    if (!room.isDJUser(socket.id)) {
      console.warn('⚠️ Non-DJ user tried to reorder queue');
      socket.emit('error-message', { message: 'Only the DJ can reorder the queue' });
      return;
    }

    const { fromIndex, toIndex } = data;
    
    console.log('🔄 ========== REORDER QUEUE ==========');
    console.log('  - From index:', fromIndex);
    console.log('  - To index:', toIndex);
    console.log('  - Queue before:', room.queue.map((v, i) => `${i}: ${v.title}`));
    
    // Validate indices
    if (fromIndex < 0 || fromIndex >= room.queue.length || 
        toIndex < 0 || toIndex >= room.queue.length) {
      console.error('❌ Invalid indices');
      return;
    }
    
    // Reorder array
    const [movedVideo] = room.queue.splice(fromIndex, 1);
    room.queue.splice(toIndex, 0, movedVideo);
    
    console.log('  - Queue after:', room.queue.map((v, i) => `${i}: ${v.title}`));
    console.log('  - Sending queue-updated to all clients');

    // Notify everyone about queue update
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
    
    console.log('✅ Queue reordered and updated');
    console.log('========================================');
  });

  // Enter disco
  socket.on('enter-disco', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);
    
    if (user) {
      room.addDiscoUser(socket.id, user.username, data.avatar, data.x, data.y);
      
      // Send all disco users to the one who just entered
      socket.emit('disco-users-update', {
        users: room.getDiscoUsers()
      });
      
      // Notify everyone about new user in disco
      io.to(currentRoom).emit('disco-users-update', {
        users: room.getDiscoUsers()
      });
      
      console.log(`${user.username} entered disco with avatar ${data.avatar}`);
    }
  });

  // Move in disco
  socket.on('move-in-disco', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    room.updateDiscoUserPosition(socket.id, data.x, data.y);
    
    // Notify everyone about movement
    io.to(currentRoom).emit('user-moved', {
      socketId: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // Sync video time (DJ only - syncs everyone)
  socket.on('sync-video', () => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);

    // Calculate current video time
    if (room.currentVideo && room.currentVideoStartTime) {
      const elapsedTime = (Date.now() - room.currentVideoStartTime) / 1000;
      room.syncTime = elapsedTime;
      
      // DJ syncs everyone
      io.to(currentRoom).emit('force-sync', {
        time: elapsedTime,
        video: room.currentVideo,
        syncedBy: 'dj'
      });
      console.log(`DJ synced everyone at ${elapsedTime}s`);
    }
  });
  
  // Request sync time (for individual user sync)
  socket.on('request-sync-time', () => {
    console.log('📥 request-sync-time recibido de:', socket.id);
    
    if (!currentRoom) {
      console.warn('⚠️ No hay currentRoom');
      return;
    }

    const room = rooms.get(currentRoom);
    console.log('📊 Estado de la sala:', {
      hasCurrentVideo: !!room.currentVideo,
      hasStartTime: !!room.currentVideoStartTime,
      videoTitle: room.currentVideo?.title
    });
    
    // Send current video state to requesting user
    if (room.currentVideo && room.currentVideoStartTime) {
      console.log('📤 Enviando sync-time-response a:', socket.id);
      socket.emit('sync-time-response', {
        currentVideo: room.currentVideo,
        currentVideoStartTime: room.currentVideoStartTime
      });
    } else {
      console.warn('⚠️ No hay video actual para sincronizar');
    }
  });

  // Transfer DJ role
  socket.on('transfer-dj', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verify it's the current DJ
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Only the DJ can transfer the role' });
      return;
    }

    const newDJId = data.newDJId;
    const fromUser = room.users.get(socket.id);
    const toUser = room.users.get(newDJId);
    
    if (toUser && fromUser) {
      // Transfer role
      if (room.transferDJ(socket.id, newDJId)) {
        // Notify everyone
        io.to(currentRoom).emit('dj-transferred', {
          users: room.getUsers(),
          djSocketId: room.getDJSocketId(),
          fromSocketId: socket.id,
          fromUsername: fromUser.username,
          toUsername: toUser.username,
          isDJ: false
        });
        
        // Notify new DJ specifically
        io.to(newDJId).emit('dj-transferred', {
          users: room.getUsers(),
          djSocketId: room.getDJSocketId(),
          fromSocketId: socket.id,
          fromUsername: fromUser.username,
          toUsername: toUser.username,
          isDJ: true
        });
        
        console.log(`DJ transferred from ${fromUser.username} to ${toUser.username}`);
      }
    }
  });

  // Chat message
  socket.on('chat-message', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);
    
    if (user) {
      // Broadcast message to everyone in room
      io.to(currentRoom).emit('chat-message', {
        username: data.username,
        message: data.message,
        timestamp: data.timestamp
      });
      
      console.log(`[${currentRoom}] ${data.username}: ${data.message}`);
    }
  });

  // Disco emote
  socket.on('disco-emote', (data) => {
    if (!currentRoom) return;
    
    io.to(currentRoom).emit('disco-emote', {
      socketId: socket.id,
      emote: data.emote
    });
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        const user = room.users.get(socket.id);
        room.removeUser(socket.id);

        // Notify other users
        io.to(currentRoom).emit('user-left', {
          users: room.getUsers(),
          username: user ? user.username : 'User',
          djSocketId: room.getDJSocketId()
        });

        // Clean up room if empty
        if (room.users.size === 0) {
          rooms.delete(currentRoom);
          console.log(`Room ${currentRoom} deleted (empty)`);
        }
      }
    }
  });
});

http.listen(PORT, () => {
  console.log(`🎵 Igloo.dj server running at http://localhost:${PORT}`);
});

