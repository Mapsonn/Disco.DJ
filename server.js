const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Servir archivos estáticos
app.use(express.static('public'));

// Estructura para almacenar las salas
const rooms = new Map();

// Estructura de una sala
class Room {
  constructor(roomId) {
    this.id = roomId;
    this.users = new Map();
    this.queue = [];
    this.currentVideo = null;
    this.currentVideoStartTime = null;
    this.isPlaying = false;
    this.discoUsers = new Map(); // Usuarios en la discoteca con avatares y posiciones
    this.djSocketId = null; // ID del DJ actual
    this.syncTime = 0; // Tiempo sincronizado del video
  }

  addUser(socketId, username) {
    // El primer usuario es DJ
    const isDJ = this.users.size === 0;
    this.users.set(socketId, { id: socketId, username, isDJ });
    
    // Si es DJ, guardarlo
    if (isDJ) {
      this.djSocketId = socketId;
    }
  }

  removeUser(socketId) {
    this.users.delete(socketId);
    this.discoUsers.delete(socketId);
    
    // Si el DJ se desconecta, asignar nuevo DJ
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
    // Remover DJ del usuario actual
    const fromUser = this.users.get(fromSocketId);
    if (fromUser) {
      fromUser.isDJ = false;
    }
    
    // Asignar DJ al nuevo usuario
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

// Función para obtener o crear una sala
function getOrCreateRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Room(roomId));
  }
  return rooms.get(roomId);
}

io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);
  let currentRoom = null;

  // Unirse a una sala
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    currentRoom = roomId;
    
    socket.join(roomId);
    const room = getOrCreateRoom(roomId);
    room.addUser(socket.id, username);

    console.log(`${username} se unió a la sala ${roomId}`);

    const user = room.users.get(socket.id);
    const isDJ = user ? user.isDJ : false;

    // Enviar estado actual de la sala al usuario que se une
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

    // Notificar a todos los usuarios de la sala sobre el nuevo usuario
    io.to(roomId).emit('user-joined', {
      users: room.getUsers(),
      username: username,
      djSocketId: room.getDJSocketId()
    });
  });

  // Agregar video a la cola
  socket.on('add-video', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);
    
    console.log('📥 Video recibido del cliente:', data);
    
    const video = {
      id: data.videoId,
      title: data.title,
      thumbnail: data.thumbnail,
      addedBy: user.username,
      duration: data.duration || 'N/A',
      views: data.views || 'N/A',
      timestamp: Date.now()
    };

    console.log('💾 Video procesado:', video);
    console.log('🎬 Video actual antes de agregar:', room.currentVideo ? 'SÍ hay video' : 'NO hay video');
    console.log('📋 Cola antes de agregar:', room.queue.length, 'videos');

    room.addToQueue(video);
    console.log('📋 Cola después de agregar:', room.queue.length, 'videos');

    // Si no hay video reproduciéndose, iniciar el siguiente
    if (!room.currentVideo) {
      const nextVideo = room.nextVideo();
      console.log('▶️ Iniciando primer video:', nextVideo);
      console.log('📋 Cola después de nextVideo():', room.queue.length, 'videos');
      io.to(currentRoom).emit('play-video', {
        video: nextVideo,
        startTime: 0
      });
    } else {
      console.log('✅ Video actual existe, agregando a cola solamente');
    }

    // Notificar a todos sobre la actualización de la cola
    console.log('📤 Enviando queue-updated con', room.queue.length, 'videos');
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Video terminado
  socket.on('video-ended', () => {
    if (!currentRoom) return;

    console.log('🏁 Video terminado, buscando siguiente...');
    const room = rooms.get(currentRoom);
    console.log('📋 Cola antes de nextVideo():', room.queue.length, 'videos');
    
    const nextVideo = room.nextVideo();
    console.log('📋 Cola después de nextVideo():', room.queue.length, 'videos');

    if (nextVideo) {
      console.log('▶️ Reproduciendo siguiente video:', nextVideo.title);
      io.to(currentRoom).emit('play-video', {
        video: nextVideo,
        startTime: 0
      });
    } else {
      console.log('❌ No hay más videos en la cola');
      io.to(currentRoom).emit('queue-empty');
    }

    console.log('📤 Enviando queue-updated con', room.queue.length, 'videos');
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Remover video de la cola (solo DJ)
  socket.on('remove-video', (videoId) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verificar que sea el DJ
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Solo el DJ puede eliminar videos' });
      return;
    }
    
    room.removeFromQueue(videoId);

    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Skip video actual (solo DJ)
  socket.on('skip-video', () => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verificar que sea el DJ
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Solo el DJ puede saltar videos' });
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

  // Actualizar duración del video
  socket.on('update-video-duration', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Actualizar duración en el video actual
    if (room.currentVideo && room.currentVideo.id === data.videoId) {
      room.currentVideo.duration = data.duration;
    }
    
    // Actualizar duración en la cola
    room.queue.forEach(video => {
      if (video.id === data.videoId) {
        video.duration = data.duration;
      }
    });

    // Notificar a todos
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
  });

  // Reordenar cola (solo DJ)
  socket.on('reorder-queue', (data) => {
    if (!currentRoom) {
      console.error('❌ reorder-queue: No hay sala actual');
      return;
    }

    const room = rooms.get(currentRoom);
    
    // Verificar que sea el DJ
    if (!room.isDJUser(socket.id)) {
      console.warn('⚠️ Usuario no-DJ intentó reordenar cola');
      socket.emit('error-message', { message: 'Solo el DJ puede reordenar la cola' });
      return;
    }

    const { fromIndex, toIndex } = data;
    
    console.log('🔄 ========== REORDENAR COLA ==========');
    console.log('  - Desde índice:', fromIndex);
    console.log('  - Hacia índice:', toIndex);
    console.log('  - Cola antes:', room.queue.map((v, i) => `${i}: ${v.title}`));
    
    // Validar índices
    if (fromIndex < 0 || fromIndex >= room.queue.length || 
        toIndex < 0 || toIndex >= room.queue.length) {
      console.error('❌ Índices inválidos');
      return;
    }
    
    // Reordenar el array
    const [movedVideo] = room.queue.splice(fromIndex, 1);
    room.queue.splice(toIndex, 0, movedVideo);
    
    console.log('  - Cola después:', room.queue.map((v, i) => `${i}: ${v.title}`));
    console.log('  - Enviando queue-updated a todos los clientes');

    // Notificar a todos sobre la actualización de la cola
    io.to(currentRoom).emit('queue-updated', {
      queue: room.queue
    });
    
    console.log('✅ Cola reordenada y actualizada');
    console.log('========================================');
  });

  // Entrar a la discoteca
  socket.on('enter-disco', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);
    
    if (user) {
      room.addDiscoUser(socket.id, user.username, data.avatar, data.x, data.y);
      
      // Enviar todos los usuarios en la disco al que acaba de entrar
      socket.emit('disco-users-update', {
        users: room.getDiscoUsers()
      });
      
      // Notificar a todos sobre el nuevo usuario en la disco
      io.to(currentRoom).emit('disco-users-update', {
        users: room.getDiscoUsers()
      });
      
      console.log(`${user.username} entró a la discoteca con avatar ${data.avatar}`);
    }
  });

  // Mover en la discoteca
  socket.on('move-in-disco', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    room.updateDiscoUserPosition(socket.id, data.x, data.y);
    
    // Notificar a todos sobre el movimiento
    io.to(currentRoom).emit('user-moved', {
      socketId: socket.id,
      x: data.x,
      y: data.y
    });
  });

  // Sincronizar tiempo del video (solo DJ)
  socket.on('sync-video', () => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verificar que sea el DJ
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Solo el DJ puede sincronizar' });
      return;
    }

    // Calcular tiempo actual del video
    if (room.currentVideo && room.currentVideoStartTime) {
      const elapsedTime = (Date.now() - room.currentVideoStartTime) / 1000;
      room.syncTime = elapsedTime;
      
      // Notificar a todos para que sincronicen
      io.to(currentRoom).emit('force-sync', {
        time: elapsedTime,
        video: room.currentVideo
      });
      
      console.log(`DJ sincronizó el video en ${elapsedTime}s`);
    }
  });

  // Transferir rol de DJ
  socket.on('transfer-dj', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    
    // Verificar que sea el DJ actual
    if (!room.isDJUser(socket.id)) {
      socket.emit('error-message', { message: 'Solo el DJ puede transferir el rol' });
      return;
    }

    const newDJId = data.newDJId;
    const fromUser = room.users.get(socket.id);
    const toUser = room.users.get(newDJId);
    
    if (toUser && fromUser) {
      // Transferir el rol
      if (room.transferDJ(socket.id, newDJId)) {
        // Notificar a todos
        io.to(currentRoom).emit('dj-transferred', {
          users: room.getUsers(),
          djSocketId: room.getDJSocketId(),
          fromSocketId: socket.id,
          fromUsername: fromUser.username,
          toUsername: toUser.username,
          isDJ: false
        });
        
        // Notificar al nuevo DJ específicamente
        io.to(newDJId).emit('dj-transferred', {
          users: room.getUsers(),
          djSocketId: room.getDJSocketId(),
          fromSocketId: socket.id,
          fromUsername: fromUser.username,
          toUsername: toUser.username,
          isDJ: true
        });
        
        console.log(`DJ transferido de ${fromUser.username} a ${toUser.username}`);
      }
    }
  });

  // Mensaje de chat
  socket.on('chat-message', (data) => {
    if (!currentRoom) return;

    const room = rooms.get(currentRoom);
    const user = room.users.get(socket.id);
    
    if (user) {
      // Transmitir el mensaje a todos en la sala
      io.to(currentRoom).emit('chat-message', {
        username: data.username,
        message: data.message,
        timestamp: data.timestamp
      });
      
      console.log(`[${currentRoom}] ${data.username}: ${data.message}`);
    }
  });

  // Emote en disco
  socket.on('disco-emote', (data) => {
    if (!currentRoom) return;
    
    io.to(currentRoom).emit('disco-emote', {
      socketId: socket.id,
      emote: data.emote
    });
  });

  // Desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
    
    if (currentRoom) {
      const room = rooms.get(currentRoom);
      if (room) {
        const user = room.users.get(socket.id);
        room.removeUser(socket.id);

        // Notificar a los demás usuarios
        io.to(currentRoom).emit('user-left', {
          users: room.getUsers(),
          username: user ? user.username : 'Usuario',
          djSocketId: room.getDJSocketId()
        });

        // Limpiar sala si está vacía
        if (room.users.size === 0) {
          rooms.delete(currentRoom);
          console.log(`Sala ${currentRoom} eliminada (vacía)`);
        }
      }
    }
  });
});

http.listen(PORT, () => {
  console.log(`🎵 Servidor corriendo en http://localhost:${PORT}`);
});

