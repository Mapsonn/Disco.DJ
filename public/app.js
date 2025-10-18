// Variables globales
let socket;
let player;
let currentUsername;
let currentRoomId;
let isPlayerReady = false;
let isVideoLoading = false;
let isDJ = false;
let djSocketId = null;
let pendingVideo = null; // Para guardar videos que llegan antes de que el player esté listo

// Sistema de temas
let currentTheme = localStorage.getItem('theme') || 'dark';

function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const icon = document.querySelector('.theme-icon');
    if (icon) {
        icon.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Inicializar tema al cargar
initTheme();

// ==================== SISTEMA DE IDIOMAS ====================

let currentLang = localStorage.getItem('language') || 'en';

const translations = {
    es: {
        // Modal de bienvenida
        'welcome': 'Bienvenido',
        'enter-username': 'Ingresa tu nombre de usuario para comenzar',
        'your-name': 'Tu nombre...',
        'enter': 'Entrar',
        'min-2-chars': 'Por favor ingresa un nombre de al menos 2 caracteres',
        
        // Header
        'copy-link': 'Copiar Link',
        'link-copied': '¡Link de la sala copiado!',
        'disco': 'Disco',
        'room': 'Sala',
        
        // Usuarios
        'online-users': 'Usuarios en línea',
        'click-to-transfer': 'Haz clic en un usuario para transferir el rol de DJ',
        'joined': 'se unió a la sala',
        'left': 'salió de la sala',
        'now-dj': '¡Ahora eres el DJ!',
        'transferred-dj': 'te transfirió el rol de DJ!',
        'dj-transferred-to': 'DJ transferido a',
        'is-new-dj': 'ahora es el DJ',
        
        // Video
        'no-video': 'Sin video',
        'add-video': 'Agregar Video',
        'add-youtube-video': 'Agregar Video de YouTube',
        'paste-youtube-link': 'Pega el enlace del video de YouTube',
        'youtube-url': 'URL de YouTube',
        'youtube-url-placeholder': 'https://www.youtube.com/watch?v=...',
        'paste-url': 'Pega aquí el link de YouTube...',
        'add': 'Agregar',
        'cancel': 'Cancelar',
        'invalid-url': 'URL de YouTube inválida',
        'skip': 'Saltar',
        'sync': 'Sync',
        'syncing': 'Sincronizando todos los usuarios...',
        'only-dj-sync': 'Solo el DJ puede sincronizar',
        'video-synced': 'Video sincronizado por el DJ a',
        'added-by': 'Agregado por',
        'add-youtube-to-start': 'Agrega un video de YouTube para comenzar',
        
        // Cola
        'queue': 'Cola',
        'empty-queue': 'La cola está vacía',
        
        // Chat
        'chat': 'Chat',
        'local-chat': 'Chat Local',
        'twitch-chat': 'Chat Twitch',
        'type-message': 'Escribe un mensaje...',
        'send': 'Enviar',
        
        // Disco
        'disco-dancing': 'Discoteca - ¡Baila con todos!',
        'hide': 'Ocultar',
        'show': 'Mostrar',
        'dancing-now': 'Bailando ahora',
        'click-to-move': 'Haz clic o usa WASD para moverte',
        'drag-to-move': 'Arrastra para mover',
        'disco-tip': 'Haz clic en la pista para moverte',
        'change-avatar': 'Cambiar Avatar',
        'controls': 'Controles',
        'move': 'Mover',
        'emotes': 'Emotes',
        'choose-avatar': 'Elige tu avatar',
        'create-or-upload': 'Crea tu pixel art o sube una imagen',
        'create-pixel-art': 'Crear Pixel Art',
        'upload-image': 'Subir Imagen',
        'saved-avatars': 'Tus avatares guardados',
        'pixel-art': 'Pixel Art',
        'image': 'Imagen',
        'avatar-updated': 'Avatar actualizado!',
        'delete-avatar-confirm': '¿Eliminar este avatar?',
        'avatar-deleted': 'Avatar eliminado',
        
        // Editor de Pixel Art
        'pixel-editor': 'Editor de Pixel Art',
        'size': 'Tamaño',
        'draw': 'Dibujar',
        'erase': 'Borrar',
        'fill': 'Rellenar',
        'color': 'Color',
        'clear': 'Limpiar',
        'save-avatar': 'Guardar Avatar',
        'clear-confirm': '¿Limpiar el canvas?',
        'pixel-art-saved': 'Pixel Art guardado!',
        'image-loaded': 'Imagen cargada!',
        'only-images': 'Solo se permiten imágenes',
        
        // Twitch
        'connect-twitch': 'Conecta tu canal de Twitch',
        'channel-name': 'Nombre del canal...',
        'connect': 'Conectar',
        'twitch-channel': 'Chat de Twitch',
        'external-window-required': 'El chat requiere ventana externa',
        'twitch-restrictions': 'Por restricciones de Twitch, el chat funciona mejor en una ventana separada.',
        'open-twitch-chat': 'Abrir Chat de Twitch',
        'also-view': 'También puedes ver el canal en:',
        'back': 'Volver',
        'change': 'Cambiar',
        
        // Errores
        'only-dj-remove': 'Solo el DJ puede eliminar videos',
        'only-dj-skip': 'Solo el DJ puede saltar videos',
        'only-dj-transfer': 'Solo el DJ puede transferir el rol'
    },
    en: {
        // Welcome modal
        'welcome': 'Welcome',
        'enter-username': 'Enter your username to begin',
        'your-name': 'Your name...',
        'enter': 'Enter',
        'min-2-chars': 'Please enter a name with at least 2 characters',
        
        // Header
        'copy-link': 'Copy Link',
        'link-copied': 'Room link copied!',
        'disco': 'Disco',
        'room': 'Room',
        
        // Users
        'online-users': 'Online Users',
        'click-to-transfer': 'Click on a user to transfer the DJ role',
        'joined': 'joined the room',
        'left': 'left the room',
        'now-dj': 'You are now the DJ!',
        'transferred-dj': 'transferred the DJ role to you!',
        'dj-transferred-to': 'DJ transferred to',
        'is-new-dj': 'is now the DJ',
        
        // Video
        'no-video': 'No video',
        'add-video': 'Add Video',
        'add-youtube-video': 'Add YouTube Video',
        'paste-youtube-link': 'Paste the YouTube video link',
        'youtube-url': 'YouTube URL',
        'youtube-url-placeholder': 'https://www.youtube.com/watch?v=...',
        'paste-url': 'Paste YouTube link here...',
        'add': 'Add',
        'cancel': 'Cancel',
        'invalid-url': 'Invalid YouTube URL',
        'skip': 'Skip',
        'sync': 'Sync',
        'syncing': 'Syncing all users...',
        'only-dj-sync': 'Only the DJ can sync',
        'video-synced': 'Video synced by DJ at',
        'added-by': 'Added by',
        'add-youtube-to-start': 'Add a YouTube video to start',
        
        // Queue
        'queue': 'Queue',
        'empty-queue': 'Queue is empty',
        
        // Chat
        'chat': 'Chat',
        'local-chat': 'Local Chat',
        'twitch-chat': 'Twitch Chat',
        'type-message': 'Type a message...',
        'send': 'Send',
        
        // Disco
        'disco-dancing': 'Disco - Dance with everyone!',
        'hide': 'Hide',
        'show': 'Show',
        'dancing-now': 'Dancing now',
        'click-to-move': 'Click or use WASD to move',
        'drag-to-move': 'Drag to move',
        'disco-tip': 'Click on the floor to move',
        'change-avatar': 'Change Avatar',
        'controls': 'Controls',
        'move': 'Move',
        'emotes': 'Emotes',
        'choose-avatar': 'Choose your avatar',
        'create-or-upload': 'Create your pixel art or upload an image',
        'create-pixel-art': 'Create Pixel Art',
        'upload-image': 'Upload Image',
        'saved-avatars': 'Your saved avatars',
        'pixel-art': 'Pixel Art',
        'image': 'Image',
        'avatar-updated': 'Avatar updated!',
        'delete-avatar-confirm': 'Delete this avatar?',
        'avatar-deleted': 'Avatar deleted',
        
        // Pixel Art Editor
        'pixel-editor': 'Pixel Art Editor',
        'size': 'Size',
        'draw': 'Draw',
        'erase': 'Erase',
        'fill': 'Fill',
        'color': 'Color',
        'clear': 'Clear',
        'save-avatar': 'Save Avatar',
        'clear-confirm': 'Clear the canvas?',
        'pixel-art-saved': 'Pixel Art saved!',
        'image-loaded': 'Image loaded!',
        'only-images': 'Only images allowed',
        
        // Twitch
        'connect-twitch': 'Connect your Twitch channel',
        'channel-name': 'Channel name...',
        'connect': 'Connect',
        'twitch-channel': 'Twitch Chat',
        'external-window-required': 'Chat requires external window',
        'twitch-restrictions': 'Due to Twitch restrictions, the chat works better in a separate window.',
        'open-twitch-chat': 'Open Twitch Chat',
        'also-view': 'You can also view the channel at:',
        'back': 'Back',
        'change': 'Change',
        
        // Errors
        'only-dj-remove': 'Only the DJ can remove videos',
        'only-dj-skip': 'Only the DJ can skip videos',
        'only-dj-transfer': 'Only the DJ can transfer the role'
    }
};

function t(key) {
    return translations[currentLang][key] || key;
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('language', lang);
    updatePageLanguage();
}

function updatePageLanguage() {
    // Actualizar elementos con data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key);
        } else {
            el.textContent = t(key);
        }
    });
    
    // Actualizar atributos title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.title = t(key);
    });
}

// Inicializar idioma
function initLanguage() {
    const selector = document.getElementById('language-selector');
    if (selector) {
        selector.value = currentLang;
        selector.addEventListener('change', (e) => {
            setLanguage(e.target.value);
        });
    }
    updatePageLanguage();
}

// Cargar idioma al inicio
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
});

// Variables del editor de pixel art
let pixelCanvas = null;
let pixelCtx = null;
let currentTool = 'draw';
let currentColor = '#000000';
let pixelSize = 32;
let cellSize = 16;
let isDrawing = false;
let savedAvatars = [];

// Generar ID de sala desde URL o crear uno nuevo
function getRoomId() {
    const hash = window.location.hash.substring(1);
    if (hash) {
        return hash;
    }
    const newRoomId = generateRoomId();
    window.location.hash = newRoomId;
    return newRoomId;
}

function generateRoomId() {
    return Math.random().toString(36).substring(2, 15);
}

// Inicializar cuando la API de YouTube esté lista
// IMPORTANTE: Esta función DEBE ser global para que YouTube API pueda llamarla
window.onYouTubeIframeAPIReady = function() {
    console.log('🎥🎥🎥 onYouTubeIframeAPIReady() LLAMADA 🎥🎥🎥');
    console.log('  - Elemento #player existe:', !!document.getElementById('player'));
    
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0,
            'modestbranding': 1
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
    
    console.log('  - Player creado:', player);
};

function onPlayerReady(event) {
    isPlayerReady = true;
    console.log('✅✅✅ Reproductor de YouTube LISTO ✅✅✅');
    console.log('  - Player state:', player.getPlayerState());
    console.log('  - Player object:', player);
    console.log('  - isPlayerReady:', isPlayerReady);
    
    // Si hay un video pendiente, reproducirlo ahora
    if (pendingVideo) {
        console.log('🎬 Reproduciendo video pendiente:', pendingVideo);
        const { video, startTime } = pendingVideo;
        pendingVideo = null;
        playVideo(video, startTime);
    }
}

function onPlayerStateChange(event) {
    console.log('🔄 Estado del player cambió:', event.data);
    
    if (event.data == YT.PlayerState.ENDED) {
        console.log('🏁 Video terminado, notificando al servidor...');
        socket.emit('video-ended');
        if (isDJ) {
            document.getElementById('skip-btn').disabled = true;
        }
        updateCurrentVideoInfo(null);
    } else if (event.data == YT.PlayerState.PLAYING) {
        console.log('▶️ Video reproduciéndose');
        document.getElementById('no-video-message').style.display = 'none';
        if (isDJ) {
            document.getElementById('skip-btn').disabled = false;
        }
    } else if (event.data == YT.PlayerState.CUED || event.data == YT.PlayerState.BUFFERING) {
        console.log('⏳ Video cargando...');
        // Obtener duración cuando el video se carga
        try {
            const duration = player.getDuration();
            if (duration && duration > 0) {
                console.log('⏱️ Duración obtenida:', duration, 'segundos');
                // Actualizar duración del video en la cola
                socket.emit('update-video-duration', { 
                    videoId: player.getVideoData().video_id,
                    duration: duration 
                });
            }
        } catch (e) {
            console.log('No se pudo obtener duración:', e);
        }
    }
}


// Mostrar notificación
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Actualizar lista de usuarios
function updateUsersList(users) {
    const usersList = document.getElementById('users-list');
    const userCount = document.getElementById('user-count');
    const djTransferHint = document.getElementById('dj-transfer-hint');
    
    userCount.textContent = users.length;
    
    // Mostrar hint solo si soy DJ
    if (isDJ && users.length > 1) {
        djTransferHint.style.display = 'block';
    } else {
        djTransferHint.style.display = 'none';
    }
    
    usersList.innerHTML = users.map(user => `
        <div class="user-item ${user.isDJ ? 'is-dj' : ''}" data-user-id="${user.id}" data-username="${user.username}">
            ${user.isDJ ? '🎧 ' : ''}${user.username}${user.isDJ ? ' (DJ)' : ''}
        </div>
    `).join('');
    
    // Agregar eventos de click para transferir DJ
    if (isDJ) {
        document.querySelectorAll('.user-item').forEach(item => {
            item.addEventListener('click', () => {
                const targetUserId = item.getAttribute('data-user-id');
                const targetUsername = item.getAttribute('data-username');
                
                // No transferir a uno mismo
                if (targetUserId !== socket.id) {
                    const confirmMsg = currentLang === 'es' 
                        ? `¿Transferir el rol de DJ a ${targetUsername}?`
                        : `Transfer DJ role to ${targetUsername}?`;
                    if (confirm(confirmMsg)) {
                        socket.emit('transfer-dj', { newDJId: targetUserId });
                    }
                }
            });
        });
    }
}

// Actualizar estado de DJ
function updateDJStatus() {
    const djBadge = document.getElementById('dj-badge');
    const skipBtn = document.getElementById('skip-btn');
    const syncBtn = document.getElementById('sync-btn');
    
    // El botón SYNC siempre está visible para todos
    syncBtn.style.display = 'inline-block';
    
    if (isDJ) {
        djBadge.style.display = 'flex';
        // El DJ siempre puede saltar (cuando hay video)
    } else {
        djBadge.style.display = 'none';
        // Los no-DJ no pueden saltar
        skipBtn.disabled = true;
    }
}

// Actualizar cola de reproducción
function updateQueue(queue) {
    console.log('📋 updateQueue() llamada con:', queue);
    console.log('  - Cantidad de videos en cola:', queue.length);
    
    const queueList = document.getElementById('queue-list');
    
    if (!queueList) {
        console.error('❌ Elemento queue-list no encontrado!');
        return;
    }
    
    if (queue.length === 0) {
        console.log('  - Cola vacía, mostrando mensaje');
        queueList.innerHTML = `<div class="empty-queue" data-i18n="empty-queue">${t('empty-queue')}</div>`;
        return;
    }
    
    console.log('  - Renderizando', queue.length, 'videos en la cola');
    queueList.innerHTML = queue.map((video, index) => `
        <div class="queue-item ${isDJ ? 'draggable' : ''}" 
             draggable="${isDJ}" 
             data-video-id="${video.id}"
             data-index="${index}">
            ${isDJ ? '<div class="drag-handle">⋮⋮</div>' : ''}
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="queue-item-info">
                <div class="queue-item-title" title="${video.title}">${video.title}</div>
                <div class="queue-item-meta">
                    ${video.duration !== 'N/A' && video.duration !== undefined ? `⏱️ ${formatDuration(video.duration)}` : ''} 
                    ${video.views !== 'N/A' && video.views !== undefined ? `${video.duration !== 'N/A' && video.duration !== undefined ? '•' : ''} 👁️ ${formatViews(video.views)}` : ''}
                </div>
                <div class="queue-item-user">${t('added-by')} ${video.addedBy}</div>
            </div>
            <button class="queue-item-remove" onclick="removeVideo('${video.id}')" title="Eliminar">×</button>
        </div>
    `).join('');
    
    // Si es DJ, agregar event listeners para drag & drop
    if (isDJ) {
        setupDragAndDrop();
    }
    
    console.log('✅ Cola renderizada correctamente');
}

// Variables para drag & drop
let draggedElement = null;
let draggedIndex = null;

// Configurar drag & drop para la cola
function setupDragAndDrop() {
    const queueItems = document.querySelectorAll('.queue-item.draggable');
    
    queueItems.forEach(item => {
        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragend', handleDragEnd);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragenter', handleDragEnter);
        item.addEventListener('dragleave', handleDragLeave);
    });
}

function handleDragStart(e) {
    draggedElement = this;
    draggedIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    
    // Remover todas las clases de drag-over
    document.querySelectorAll('.queue-item').forEach(item => {
        item.classList.remove('drag-over');
    });
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    if (this !== draggedElement) {
        this.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    e.preventDefault();
    
    if (draggedElement !== this) {
        const dropIndex = parseInt(this.dataset.index);
        
        console.log('🔄 DROP detectado!');
        console.log('  - Desde índice:', draggedIndex);
        console.log('  - Hacia índice:', dropIndex);
        console.log('  - Socket conectado:', socket && socket.connected);
        
        // Enviar nuevo orden al servidor
        socket.emit('reorder-queue', {
            fromIndex: draggedIndex,
            toIndex: dropIndex
        });
        
        console.log('✅ Evento reorder-queue enviado al servidor');
    } else {
        console.log('⚠️ Drop en el mismo elemento, ignorando');
    }
    
    return false;
}

// Actualizar información del video actual
function updateCurrentVideoInfo(video) {
    const titleEl = document.getElementById('current-video-title');
    const addedByEl = document.getElementById('current-video-addedby');
    
    if (video) {
        titleEl.textContent = video.title;
        addedByEl.textContent = `${t('added-by')} ${video.addedBy}`;
    } else {
        titleEl.textContent = t('no-video');
        addedByEl.textContent = '';
    }
}

// Reproducir video
function playVideo(video, startTime = 0) {
    console.log('🎬 playVideo() llamada');
    console.log('  - isPlayerReady:', isPlayerReady);
    console.log('  - isVideoLoading:', isVideoLoading);
    console.log('  - player:', player);
    
    if (!isPlayerReady) {
        console.warn('⚠️ Player NO está listo todavía, guardando video como pendiente...');
        pendingVideo = { video, startTime };
        console.log('💾 Video guardado en pendiente:', pendingVideo);
        return;
    }
    
    if (isVideoLoading) {
        console.warn('⚠️ Ya hay un video cargando...');
        return;
    }
    
    console.log('✅ Continuando con reproducción...');
    console.log('  - Video recibido:', video);
    
    isVideoLoading = true;
    updateCurrentVideoInfo(video);
    
    // Asegurar que tenemos el ID correcto
    const videoId = video.id || video.videoId;
    
    console.log('  - Video ID extraído:', videoId);
    
    if (!videoId) {
        console.error('❌ No se encontró ID de video:', video);
        isVideoLoading = false;
        return;
    }
    
    console.log('▶️ Llamando a player.loadVideoById con:', videoId);
    
    try {
        player.loadVideoById({
            videoId: videoId,
            startSeconds: startTime
        });
        console.log('✅ loadVideoById ejecutado');
    } catch (error) {
        console.error('❌ Error al cargar video:', error);
        isVideoLoading = false;
        return;
    }
    
    document.getElementById('no-video-message').style.display = 'none';
    document.getElementById('skip-btn').disabled = false;
    
    setTimeout(() => {
        isVideoLoading = false;
    }, 1000);
}

// Remover video de la cola
function removeVideo(videoId) {
    socket.emit('remove-video', videoId);
}

// Sincronizar reproductor local (para usuarios no-DJ) - 100% local, sin servidor
function syncLocalPlayer() {
    console.log('🔄 syncLocalPlayer() llamada (local, sin servidor)');
    console.log('  - player ready:', isPlayerReady);
    console.log('  - localVideoStartTime:', localVideoStartTime);
    
    if (!player || !isPlayerReady) {
        console.error('❌ Player no está listo');
        showNotification('❌ Player not ready');
        return;
    }
    
    if (!localVideoStartTime) {
        console.error('❌ No hay timestamp de inicio');
        showNotification('❌ No video playing');
        return;
    }
    
    // Calcular tiempo transcurrido LOCALMENTE (sin servidor = 0ms latencia)
    const elapsedTime = (Date.now() - localVideoStartTime) / 1000;
    console.log('⏱️ Sincronizando localmente a:', elapsedTime, 'segundos');
    
    // Sincronizar inmediatamente
    player.seekTo(elapsedTime, true);
    
    const msg = currentLang === 'es' 
        ? `🔄 Sincronizado a ${Math.floor(elapsedTime)}s`
        : `🔄 Synced to ${Math.floor(elapsedTime)}s`;
    showNotification(msg);
}

// Variable para guardar el tiempo de inicio del video actual
let localVideoStartTime = null;

// Verificar si la API de YouTube se está cargando
console.log('📺 Verificando carga de YouTube API...');
console.log('  - YT disponible:', typeof YT !== 'undefined');
console.log('  - onYouTubeIframeAPIReady definida:', typeof window.onYouTubeIframeAPIReady);

// Fallback: Si después de 5 segundos el player no se inicializó, intentar manualmente
setTimeout(() => {
    if (!isPlayerReady && typeof YT !== 'undefined' && YT.Player) {
        console.warn('⚠️ YouTube API cargada pero player no inicializado. Intentando manualmente...');
        window.onYouTubeIframeAPIReady();
    }
}, 5000);

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    currentRoomId = getRoomId();
    
    // Modal de bienvenida
    const welcomeModal = document.getElementById('welcome-modal');
    const usernameInput = document.getElementById('username-input');
    const joinBtn = document.getElementById('join-btn');
    
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            joinBtn.click();
        }
    });
    
    joinBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        if (username.length < 2) {
            alert(t('min-2-chars'));
            return;
        }
        
        currentUsername = username;
        welcomeModal.style.display = 'none';
        document.getElementById('app').style.display = 'block';
        document.getElementById('username-display').textContent = username;
        document.getElementById('room-id-display').textContent = `${t('room')}: ${currentRoomId}`;
        
        // Conectar a Socket.io
        initSocket();
    });
    
    // Copiar link de la sala
    document.getElementById('copy-link-btn').addEventListener('click', () => {
        const roomUrl = window.location.href;
        navigator.clipboard.writeText(roomUrl).then(() => {
            showNotification(t('link-copied'));
        });
    });
    
    // Agregar video
    const addVideoBtn = document.getElementById('add-video-btn');
    const addVideoModal = document.getElementById('add-video-modal');
    const videoUrlInput = document.getElementById('video-url-input');
    const confirmAddBtn = document.getElementById('confirm-add-btn');
    const cancelAddBtn = document.getElementById('cancel-add-btn');
    const videoError = document.getElementById('video-error');
    
    addVideoBtn.addEventListener('click', () => {
        addVideoModal.style.display = 'flex';
        videoUrlInput.value = '';
        videoError.style.display = 'none';
        videoUrlInput.focus();
    });
    
    cancelAddBtn.addEventListener('click', () => {
        addVideoModal.style.display = 'none';
    });
    
    videoUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            confirmAddBtn.click();
        }
    });
    
    confirmAddBtn.addEventListener('click', async () => {
        const url = videoUrlInput.value.trim();
        const videoId = extractVideoId(url);
        
        if (!videoId) {
            videoError.textContent = t('invalid-url');
            videoError.style.display = 'block';
            return;
        }
        
        const videoInfo = await getVideoInfo(videoId);
        if (!videoInfo) {
            videoError.textContent = t('invalid-url');
            videoError.style.display = 'block';
            return;
        }
        
        console.log('➕ Enviando video al servidor:', videoInfo);
        socket.emit('add-video', videoInfo);
        addVideoModal.style.display = 'none';
        showNotification(t('add-video') + ' ✓');
    });
    
    // Skip video
    document.getElementById('skip-btn').addEventListener('click', () => {
        socket.emit('skip-video');
    });
    
    // Botón SYNC - Ahora disponible para todos
    document.getElementById('sync-btn').addEventListener('click', () => {
        if (player && isPlayerReady) {
            if (isDJ) {
                // DJ sincroniza a todos a través del servidor
                socket.emit('sync-video');
                showNotification(`🔄 ${t('syncing')}`);
            } else {
                // Usuario normal se sincroniza localmente (sin latencia)
                syncLocalPlayer();
            }
        }
    });
});

// Inicializar Socket.io
function initSocket() {
    socket = io();
    
    socket.emit('join-room', {
        roomId: currentRoomId,
        username: currentUsername
    });
    
    // Estado inicial de la sala
    socket.on('room-state', (data) => {
        console.log('🏠 Estado de sala recibido:', data);
        updateUsersList(data.users);
        updateQueue(data.queue);
        
        // Configurar rol de DJ
        isDJ = data.isDJ || false;
        djSocketId = data.djSocketId;
        updateDJStatus();
        
        if (data.currentVideo) {
            console.log('📺 Hay video actual, intentando reproducir...');
            localVideoStartTime = data.currentVideoStartTime;
            const elapsedTime = (Date.now() - data.currentVideoStartTime) / 1000;
            playVideo(data.currentVideo, elapsedTime);
        } else {
            console.log('❌ No hay video actual');
            document.getElementById('no-video-message').style.display = 'flex';
        }
    });
    
    // Usuario se unió
    socket.on('user-joined', (data) => {
        updateUsersList(data.users);
        djSocketId = data.djSocketId;
        updateDJStatus();
        showNotification(`${data.username} ${t('joined')}`);
    });
    
    // Usuario se fue
    socket.on('user-left', (data) => {
        updateUsersList(data.users);
        djSocketId = data.djSocketId;
        
        // Si el DJ se fue y ahora somos DJ
        if (djSocketId === socket.id && !isDJ) {
            isDJ = true;
            updateDJStatus();
            showNotification(`🎧 ${t('now-dj')}`);
        }
        
        showNotification(`${data.username} ${t('left')}`);
    });
    
    // Cola actualizada
    socket.on('queue-updated', (data) => {
        console.log('🔄 Evento queue-updated recibido:', data);
        updateQueue(data.queue);
    });
    
    // Reproducir video
    socket.on('play-video', (data) => {
        console.log('📺 ========================================');
        console.log('📺 Recibido evento play-video:');
        console.log('  - Video ID:', data.video?.id);
        console.log('  - Video título:', data.video?.title);
        console.log('  - isPlayerReady:', isPlayerReady);
        console.log('  - isVideoLoading:', isVideoLoading);
        console.log('  - player existe:', !!player);
        console.log('  - pendingVideo actual:', pendingVideo);
        console.log('📺 ========================================');
        localVideoStartTime = Date.now() - (data.startTime * 1000);
        playVideo(data.video, data.startTime);
    });
    
    // Respuesta a solicitud de tiempo de sincronización
    socket.on('sync-time-response', (data) => {
        console.log('📥 sync-time-response recibido:', data);
        console.log('  - player ready:', isPlayerReady);
        console.log('  - currentVideo:', data.currentVideo);
        
        if (player && isPlayerReady && data.currentVideo) {
            localVideoStartTime = data.currentVideoStartTime;
            const elapsedTime = (Date.now() - data.currentVideoStartTime) / 1000;
            console.log('⏱️ Sincronizando a:', elapsedTime, 'segundos');
            player.seekTo(elapsedTime, true);
            const msg = currentLang === 'es' 
                ? `🔄 Sincronizado a ${Math.floor(elapsedTime)}s`
                : `🔄 Synced to ${Math.floor(elapsedTime)}s`;
            showNotification(msg);
        } else {
            console.warn('⚠️ No se pudo sincronizar:', {
                playerReady: isPlayerReady,
                hasCurrentVideo: !!data.currentVideo
            });
        }
    });
    
    // Cola vacía
    socket.on('queue-empty', () => {
        console.log('📭 Cola vacía recibido del servidor');
        document.getElementById('no-video-message').style.display = 'flex';
        document.getElementById('skip-btn').disabled = true;
        updateCurrentVideoInfo(null);
    });
    
    // Sincronización forzada por DJ o propia
    socket.on('force-sync', (data) => {
        if (player && isPlayerReady && data.video) {
            player.seekTo(data.time, true);
            if (data.syncedBy === 'dj') {
                showNotification(`🔄 ${t('video-synced')} ${Math.floor(data.time)}s`);
            } else if (data.syncedBy === 'self') {
                const msg = currentLang === 'es' 
                    ? `🔄 Sincronizado a ${Math.floor(data.time)}s`
                    : `🔄 Synced to ${Math.floor(data.time)}s`;
                showNotification(msg);
            }
        }
    });
    
    // Mensajes de error
    socket.on('error-message', (data) => {
        showNotification(`❌ ${data.message}`);
    });
    
    // Transferencia de DJ
    socket.on('dj-transferred', (data) => {
        isDJ = data.isDJ;
        djSocketId = data.djSocketId;
        updateUsersList(data.users);
        updateDJStatus();
        
        if (data.isDJ) {
            showNotification(`🎧 ${data.fromUsername} ${t('transferred-dj')}`);
        } else if (data.fromSocketId === socket.id) {
            showNotification(`✅ ${t('dj-transferred-to')} ${data.toUsername}`);
        } else {
            showNotification(`🎧 ${data.toUsername} ${t('is-new-dj')}`);
        }
    });
    
    // Eventos de discoteca
    socket.on('disco-users-update', (data) => {
        updateDiscoUsers(data.users);
    });
    
    socket.on('user-moved', (data) => {
        updateUserPosition(data.socketId, data.x, data.y);
    });
    
    // Recibir mensajes de chat
    socket.on('chat-message', (data) => {
        console.log('Mensaje recibido:', data);
        displayChatMessage(data);
    });
    
    // Recibir emotes en disco
    socket.on('disco-emote', (data) => {
        const dancer = document.getElementById(`dancer-${data.socketId}`);
        if (!dancer) return;
        
        const emoteEl = document.createElement('div');
        emoteEl.className = 'disco-emote';
        emoteEl.textContent = data.emote;
        dancer.appendChild(emoteEl);
        
        setTimeout(() => emoteEl.remove(), 2000);
    });
}

// ============================================
// DISCOTECA - PIXEL ART
// ============================================

let userAvatar = null;
let discoCanvas = null;
let discoCtx = null;
let discoUsers = {};
let animationFrame = null;
let discoColors = ['#ff006e', '#8338ec', '#3a86ff', '#ffbe0b', '#fb5607', '#2ecc71'];
let colorIndex = 0;

// Inicializar disco
function initDisco() {
    discoCanvas = document.getElementById('disco-canvas');
    if (!discoCanvas) return;
    
    discoCtx = discoCanvas.getContext('2d');
    discoCtx.imageSmoothingEnabled = false;
    
    // Ajustar tamaño del canvas a su contenedor
    const container = discoCanvas.parentElement;
    const rect = container.getBoundingClientRect();
    discoCanvas.width = Math.min(rect.width - 40, 800);
    discoCanvas.height = 300;
    
    // Dibujar pista de baile inicial
    drawDiscoFloor();
    
    // Agregar event listeners para arrastre (solo una vez)
    if (!discoCanvas.hasAttribute('data-initialized')) {
        discoCanvas.style.cursor = 'pointer';
        discoCanvas.addEventListener('mousedown', handleDiscoMouseDown);
        discoCanvas.addEventListener('mousemove', handleDiscoMouseMove);
        discoCanvas.addEventListener('mouseup', handleDiscoMouseUp);
        discoCanvas.addEventListener('mouseleave', handleDiscoMouseUp);
        discoCanvas.setAttribute('data-initialized', 'true');
    }
    
    // Iniciar animación
    if (!animationFrame) {
        animateDiscoFloor();
    }
}

// Dibujar pista de baile con luces
function drawDiscoFloor() {
    const tileSize = 50;
    const cols = Math.ceil(discoCanvas.width / tileSize);
    const rows = Math.ceil(discoCanvas.height / tileSize);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const colorIdx = (row + col + colorIndex) % discoColors.length;
            const color = discoColors[colorIdx];
            const alpha = 0.3 + Math.sin(Date.now() / 1000 + row + col) * 0.2;
            
            discoCtx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
            discoCtx.fillRect(col * tileSize, row * tileSize, tileSize - 2, tileSize - 2);
        }
    }
}

// Animar pista de baile
function animateDiscoFloor() {
    drawDiscoFloor();
    colorIndex = (colorIndex + 1) % 100;
    animationFrame = requestAnimationFrame(animateDiscoFloor);
}

// Actualizar usuarios en la disco
function updateDiscoUsers(users) {
    const discoUsersContainer = document.getElementById('disco-users');
    const discoUsersList = document.getElementById('disco-users-list');
    
    // Limpiar contenedores
    discoUsersContainer.innerHTML = '';
    discoUsersList.innerHTML = '';
    
    users.forEach(user => {
        // Agregar bailarín visual
        const dancer = document.createElement('div');
        dancer.className = 'disco-dancer';
        dancer.id = `dancer-${user.socketId}`;
        dancer.style.left = user.x + 'px';
        dancer.style.top = user.y + 'px';
        
        const avatar = document.createElement('div');
        avatar.className = 'custom-avatar-display';
        
        // Verificar si tiene avatar personalizado
        if (user.avatar && typeof user.avatar === 'object') {
            const img = document.createElement('img');
            img.src = user.avatar.data;
            img.style.width = '64px';
            img.style.height = '64px';
            img.style.objectFit = 'cover';
            img.style.borderRadius = (user.avatar.type === 'image' || user.avatar.type === 'gif') ? '50%' : '0';
            img.style.imageRendering = user.avatar.type === 'pixelart' ? 'pixelated' : 'auto';
            avatar.appendChild(img);
        } else {
            // Avatar predeterminado
            avatar.className = `pixel-avatar avatar-${user.avatar || 1}`;
        }
        
        const label = document.createElement('div');
        label.className = 'username-label';
        label.textContent = user.username;
        
        dancer.appendChild(avatar);
        dancer.appendChild(label);
        discoUsersContainer.appendChild(dancer);
        
        // Agregar a lista
        const userItem = document.createElement('div');
        userItem.className = 'disco-user-item';
        
        const listAvatar = document.createElement('div');
        listAvatar.style.width = '32px';
        listAvatar.style.height = '32px';
        listAvatar.style.display = 'inline-block';
        listAvatar.style.marginRight = '10px';
        
        if (user.avatar && typeof user.avatar === 'object') {
            const img = document.createElement('img');
            img.src = user.avatar.data;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = (user.avatar.type === 'image' || user.avatar.type === 'gif') ? '50%' : '0';
            img.style.imageRendering = user.avatar.type === 'pixelart' ? 'pixelated' : 'auto';
            listAvatar.appendChild(img);
        } else {
            listAvatar.className = `pixel-avatar avatar-${user.avatar || 1}`;
            listAvatar.style.transform = 'scale(0.5)';
        }
        
        userItem.appendChild(listAvatar);
        
        const span = document.createElement('span');
        span.textContent = user.username;
        userItem.appendChild(span);
        
        discoUsersList.appendChild(userItem);
        
        discoUsers[user.socketId] = user;
    });
}

// Actualizar posición de un usuario
function updateUserPosition(socketId, x, y) {
    // No actualizar mi propio dancer (ya se mueve localmente)
    if (socket && socketId === socket.id) {
        if (discoUsers[socketId]) {
            discoUsers[socketId].x = x;
            discoUsers[socketId].y = y;
        }
        return;
    }
    
    const dancer = document.getElementById(`dancer-${socketId}`);
    if (dancer) {
        dancer.style.left = x + 'px';
        dancer.style.top = y + 'px';
    }
    
    if (discoUsers[socketId]) {
        discoUsers[socketId].x = x;
        discoUsers[socketId].y = y;
    }
}

// ==================== MOVIMIENTO CON MOUSE (ARRASTRE) ====================

let playerPosition = { x: 400, y: 200 };
let isDragging = false;
let dragStartPos = { x: 0, y: 0 };
let lastSyncTime = 0;

// Iniciar arrastre
function handleDiscoMouseDown(e) {
    if (!discoVisible) return;
    
    const rect = discoCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Verificar si el click está cerca del personaje
    const distance = Math.sqrt(
        Math.pow(mouseX - playerPosition.x, 2) + 
        Math.pow(mouseY - playerPosition.y, 2)
    );
    
    if (distance < 40) { // Radio de 40px para agarrar
        isDragging = true;
        dragStartPos = { x: mouseX - playerPosition.x, y: mouseY - playerPosition.y };
        discoCanvas.style.cursor = 'grabbing';
    } else {
        // Click fuera del personaje = mover ahí
        moveToPosition(mouseX, mouseY);
    }
}

// Arrastrar
function handleDiscoMouseMove(e) {
    if (!isDragging || !discoVisible) return;
    
    const rect = discoCanvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let newX = mouseX - dragStartPos.x;
    let newY = mouseY - dragStartPos.y;
    
    // Limitar al área de la pista
    newX = Math.max(30, Math.min(770, newX));
    newY = Math.max(30, Math.min(270, newY));
    
    playerPosition.x = newX;
    playerPosition.y = newY;
    
    // Actualizar visual inmediatamente
    const myDancer = document.getElementById(`dancer-${socket.id}`);
    if (myDancer) {
        myDancer.style.left = newX + 'px';
        myDancer.style.top = newY + 'px';
    }
    
    // Sincronizar con servidor (throttled)
    const now = Date.now();
    if (now - lastSyncTime > 100) {
        socket.emit('move-in-disco', { x: newX, y: newY });
        lastSyncTime = now;
    }
}

// Soltar arrastre
function handleDiscoMouseUp() {
    if (isDragging) {
        isDragging = false;
        discoCanvas.style.cursor = 'pointer';
        
        // Enviar posición final
        socket.emit('move-in-disco', { x: playerPosition.x, y: playerPosition.y });
    }
}

// Mover a posición (click)
function moveToPosition(x, y) {
    // Limitar al área
    x = Math.max(30, Math.min(770, x));
    y = Math.max(30, Math.min(270, y));
    
    playerPosition.x = x;
    playerPosition.y = y;
    
    // Actualizar visual
    const myDancer = document.getElementById(`dancer-${socket.id}`);
    if (myDancer) {
        myDancer.style.left = x + 'px';
        myDancer.style.top = y + 'px';
    }
    
    // Enviar al servidor
    socket.emit('move-in-disco', { x, y });
}

// Event listeners para emotes con teclado
document.addEventListener('keydown', (e) => {
    if (!discoVisible) return;
    
    // Emotes con números
    if (e.key >= '1' && e.key <= '5') {
        const emotes = ['🎉', '💃', '🕺', '❤️', '⭐'];
        const emote = emotes[parseInt(e.key) - 1];
        socket.emit('disco-emote', { emote });
        showEmote(emote);
    }
});

// Mostrar emote local
function showEmote(emote) {
    const dancer = document.getElementById(`dancer-${socket.id}`);
    if (!dancer) return;
    
    const emoteEl = document.createElement('div');
    emoteEl.className = 'disco-emote';
    emoteEl.textContent = emote;
    dancer.appendChild(emoteEl);
    
    setTimeout(() => emoteEl.remove(), 2000);
}

// Variables para controlar el estado de la disco
let discoVisible = false;

// Event listeners para disco
document.addEventListener('DOMContentLoaded', () => {
    // Botón de tema
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    // Botón de disco en header
    const discoBtn = document.getElementById('disco-btn');
    const discoSection = document.getElementById('disco-section');
    const toggleDiscoBtn = document.getElementById('toggle-disco-btn');
    const avatarModal = document.getElementById('avatar-modal');
    const closeAvatarModal = document.getElementById('close-avatar-modal');
    
    discoBtn.addEventListener('click', () => {
        if (!userAvatar) {
            // Mostrar selector de avatar
            avatarModal.style.display = 'flex';
        } else {
            // Toggle disco
            toggleDisco();
        }
    });
    
    toggleDiscoBtn.addEventListener('click', () => {
        toggleDisco();
    });
    
    closeAvatarModal.addEventListener('click', () => {
        avatarModal.style.display = 'none';
    });
    
    // Botón para cambiar avatar en la disco
    const changeAvatarBtn = document.getElementById('change-avatar-btn');
    if (changeAvatarBtn) {
        changeAvatarBtn.addEventListener('click', () => {
            avatarModal.style.display = 'flex';
        });
    }
    
    // Click en emotes preview
    document.querySelectorAll('.emotes-preview span').forEach((emoteEl, index) => {
        emoteEl.addEventListener('click', () => {
            if (!discoVisible) return;
            
            const emotes = ['🎉', '💃', '🕺', '❤️', '⭐'];
            const emote = emotes[index];
            socket.emit('disco-emote', { emote });
            showEmote(emote);
        });
    });
});

// Toggle de la discoteca
function toggleDisco() {
    const discoSection = document.getElementById('disco-section');
    const toggleBtn = document.getElementById('toggle-disco-btn');
    
    discoVisible = !discoVisible;
    
    if (discoVisible) {
        discoSection.style.display = 'block';
        toggleBtn.textContent = t('hide');
        openDisco();
    } else {
        discoSection.style.display = 'none';
        toggleBtn.textContent = t('show');
        
        // Detener arrastre si está activo
        isDragging = false;
        if (discoCanvas) {
            discoCanvas.style.cursor = 'pointer';
        }
        
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
    }
}

// Abrir disco
function openDisco() {
    const discoSection = document.getElementById('disco-section');
    discoSection.style.display = 'block';
    discoVisible = true;
    
    // Inicializar posición aleatoria
    playerPosition.x = Math.random() * 740 + 30;
    playerPosition.y = Math.random() * 240 + 30;
    
    // Pequeño delay para asegurar que el canvas esté visible
    setTimeout(() => {
        initDisco();
        
        // Emitir que entramos a la disco
        socket.emit('enter-disco', {
            avatar: userAvatar,
            x: playerPosition.x,
            y: playerPosition.y
        });
    }, 100);
}

// ============================================
// EDITOR DE PIXEL ART Y AVATARES
// ============================================

// Cargar avatares guardados del localStorage
function loadSavedAvatars() {
    const saved = localStorage.getItem('userAvatars');
    if (saved) {
        savedAvatars = JSON.parse(saved);
    }
}

// Guardar avatares en localStorage
function saveavatarsToStorage() {
    localStorage.setItem('userAvatars', JSON.stringify(savedAvatars));
}

// Mostrar avatares guardados
function displaySavedAvatars() {
    const savedSection = document.getElementById('saved-avatars-section');
    const savedGrid = document.getElementById('saved-avatars-grid');
    
    if (savedAvatars.length > 0) {
        savedSection.style.display = 'block';
        savedGrid.innerHTML = savedAvatars.map((avatar, index) => `
            <div class="saved-avatar-item" data-index="${index}">
                <button class="delete-avatar-btn" onclick="deleteAvatar(${index})">×</button>
                <div class="saved-avatar-preview">
                    <img src="${avatar.data}" alt="Avatar ${index + 1}">
                </div>
                <span>${avatar.type === 'pixelart' ? t('pixel-art') : avatar.type === 'gif' ? 'GIF' : t('image')}</span>
            </div>
        `).join('');
        
        // Agregar eventos de click
        document.querySelectorAll('.saved-avatar-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('delete-avatar-btn')) {
                    const index = parseInt(item.getAttribute('data-index'));
                    selectSavedAvatar(index);
                }
            });
        });
    } else {
        savedSection.style.display = 'none';
    }
}

// Seleccionar avatar guardado
function selectSavedAvatar(index) {
    const avatar = savedAvatars[index];
    userAvatar = { type: avatar.type, data: avatar.data };
    document.getElementById('avatar-modal').style.display = 'none';
    
    // Si ya estamos en la disco, actualizar el avatar
    if (discoVisible && socket) {
        socket.emit('enter-disco', {
            avatar: userAvatar,
            x: playerPosition.x,
            y: playerPosition.y
        });
        showNotification(`🎭 ${t('avatar-updated')}`);
    } else {
        openDisco();
    }
}

// Eliminar avatar
function deleteAvatar(index) {
    if (confirm(t('delete-avatar-confirm'))) {
        savedAvatars.splice(index, 1);
        saveavatarsToStorage();
        displaySavedAvatars();
        showNotification(t('avatar-deleted'));
    }
}

// Inicializar editor de pixel art
function initPixelEditor() {
    pixelCanvas = document.getElementById('pixel-canvas');
    pixelCtx = pixelCanvas.getContext('2d');
    pixelCtx.imageSmoothingEnabled = false;
    
    updateCanvasSize();
    clearCanvas();
    
    // Event listeners del canvas
    pixelCanvas.addEventListener('mousedown', startDrawing);
    pixelCanvas.addEventListener('mousemove', draw);
    pixelCanvas.addEventListener('mouseup', stopDrawing);
    pixelCanvas.addEventListener('mouseleave', stopDrawing);
}

// Actualizar tamaño del canvas
function updateCanvasSize() {
    cellSize = 512 / pixelSize;
    clearCanvas();
}

// Limpiar canvas
function clearCanvas() {
    pixelCtx.clearRect(0, 0, 512, 512);
    drawGrid();
}

// Dibujar grid
function drawGrid() {
    pixelCtx.strokeStyle = '#e0e0e0';
    pixelCtx.lineWidth = 1;
    
    for (let i = 0; i <= pixelSize; i++) {
        pixelCtx.beginPath();
        pixelCtx.moveTo(i * cellSize, 0);
        pixelCtx.lineTo(i * cellSize, 512);
        pixelCtx.stroke();
        
        pixelCtx.beginPath();
        pixelCtx.moveTo(0, i * cellSize);
        pixelCtx.lineTo(512, i * cellSize);
        pixelCtx.stroke();
    }
}

// Obtener posición del pixel
function getPixelPos(e) {
    const rect = pixelCanvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / cellSize);
    const y = Math.floor((e.clientY - rect.top) / cellSize);
    return { x, y };
}

// Iniciar dibujo
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

// Dibujar
function draw(e) {
    if (!isDrawing && currentTool !== 'fill') return;
    
    const pos = getPixelPos(e);
    
    if (currentTool === 'draw') {
        drawPixel(pos.x, pos.y, currentColor);
    } else if (currentTool === 'erase') {
        erasePixel(pos.x, pos.y);
    } else if (currentTool === 'fill') {
        floodFill(pos.x, pos.y, currentColor);
    }
}

// Detener dibujo
function stopDrawing() {
    isDrawing = false;
}

// Dibujar un pixel
function drawPixel(x, y, color) {
    if (x < 0 || x >= pixelSize || y < 0 || y >= pixelSize) return;
    
    pixelCtx.fillStyle = color;
    pixelCtx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

// Borrar un pixel (transparente)
function erasePixel(x, y) {
    if (x < 0 || x >= pixelSize || y < 0 || y >= pixelSize) return;
    
    pixelCtx.clearRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

// Flood fill (rellenar)
function floodFill(startX, startY, fillColor) {
    const imageData = pixelCtx.getImageData(0, 0, 512, 512);
    const targetColor = getPixelColor(imageData, startX * cellSize, startY * cellSize);
    
    if (colorsMatch(targetColor, hexToRgb(fillColor))) return;
    
    const stack = [[startX, startY]];
    
    while (stack.length > 0) {
        const [x, y] = stack.pop();
        
        if (x < 0 || x >= pixelSize || y < 0 || y >= pixelSize) continue;
        
        const currentColor = getPixelColor(imageData, x * cellSize, y * cellSize);
        
        if (!colorsMatch(currentColor, targetColor)) continue;
        
        drawPixel(x, y, fillColor);
        
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
    }
}

// Obtener color de un pixel
function getPixelColor(imageData, x, y) {
    const index = (y * 512 + x) * 4;
    return {
        r: imageData.data[index],
        g: imageData.data[index + 1],
        b: imageData.data[index + 2],
        a: imageData.data[index + 3]
    };
}

// Convertir hex a RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 255
    } : null;
}

// Comparar colores
function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b;
}

// Guardar pixel art
function savePixelArt() {
    // Crear canvas temporal del tamaño original
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = pixelSize;
    tempCanvas.height = pixelSize;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.imageSmoothingEnabled = false;
    
    // Escalar y copiar
    tempCtx.drawImage(pixelCanvas, 0, 0, pixelSize, pixelSize);
    
    // Convertir a base64
    const dataUrl = tempCanvas.toDataURL('image/png');
    
    // Guardar
    savedAvatars.push({
        type: 'pixelart',
        data: dataUrl,
        timestamp: Date.now()
    });
    
    saveavatarsToStorage();
    showNotification(`✅ ${t('pixel-art-saved')}`);
    
    // Cerrar editor y mostrar avatares
    document.getElementById('pixel-editor-modal').style.display = 'none';
    document.getElementById('avatar-modal').style.display = 'flex';
    displaySavedAvatars();
}

// Event listeners del editor
document.addEventListener('DOMContentLoaded', () => {
    loadSavedAvatars();
    
    // Botones del modal de avatar
    document.getElementById('create-pixel-art-btn').addEventListener('click', () => {
        document.getElementById('avatar-modal').style.display = 'none';
        document.getElementById('pixel-editor-modal').style.display = 'flex';
        initPixelEditor();
    });
    
    document.getElementById('upload-image-btn').addEventListener('click', () => {
        document.getElementById('avatar-file-input').click();
    });
    
    // Subir imagen/GIF
    document.getElementById('avatar-file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validar que sea imagen
            if (!file.type.startsWith('image/')) {
                showNotification(`❌ ${t('only-images')}`);
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                // Si es GIF, guardar directamente sin procesar
                if (file.type === 'image/gif') {
                    savedAvatars.push({
                        type: 'gif',
                        data: event.target.result,
                        timestamp: Date.now()
                    });
                    saveavatarsToStorage();
                    showNotification(`✅ GIF ${currentLang === 'es' ? 'cargado' : 'loaded'}!`);
                    displaySavedAvatars();
                } else {
                    // Redimensionar imagen a 64x64
                    const img = new Image();
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 64;
                        canvas.height = 64;
                        const ctx = canvas.getContext('2d');
                        ctx.drawImage(img, 0, 0, 64, 64);
                        
                        savedAvatars.push({
                            type: 'image',
                            data: canvas.toDataURL('image/png'),
                            timestamp: Date.now()
                        });
                        saveavatarsToStorage();
                        showNotification(`✅ ${t('image-loaded')}`);
                        displaySavedAvatars();
                    };
                    img.src = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        }
        // Limpiar el input para permitir cargar el mismo archivo de nuevo
        e.target.value = '';
    });
    
    // Herramientas del editor
    document.getElementById('tool-draw').addEventListener('click', () => {
        currentTool = 'draw';
        updateToolButtons();
    });
    
    document.getElementById('tool-erase').addEventListener('click', () => {
        currentTool = 'erase';
        updateToolButtons();
    });
    
    document.getElementById('tool-fill').addEventListener('click', () => {
        currentTool = 'fill';
        updateToolButtons();
    });
    
    // Color
    document.getElementById('pixel-color').addEventListener('input', (e) => {
        currentColor = e.target.value;
    });
    
    // Paleta de colores
    document.querySelectorAll('.palette-color').forEach(color => {
        color.addEventListener('click', () => {
            currentColor = color.getAttribute('data-color');
            document.getElementById('pixel-color').value = currentColor;
        });
    });
    
    // Tamaño del canvas
    document.getElementById('canvas-size-select').addEventListener('change', (e) => {
        pixelSize = parseInt(e.target.value);
        document.getElementById('canvas-size-display').textContent = `${pixelSize}x${pixelSize}`;
        updateCanvasSize();
    });
    
    // Acciones del editor
    document.getElementById('clear-canvas-btn').addEventListener('click', () => {
        if (confirm(t('clear-confirm'))) {
            clearCanvas();
        }
    });
    
    document.getElementById('save-pixel-art-btn').addEventListener('click', savePixelArt);
    
    document.getElementById('close-pixel-editor-btn').addEventListener('click', () => {
        document.getElementById('pixel-editor-modal').style.display = 'none';
        document.getElementById('avatar-modal').style.display = 'flex';
    });
    
    // Mostrar avatares cuando se abre el modal
    const originalAvatarModal = document.getElementById('avatar-modal');
    const observer = new MutationObserver(() => {
        if (originalAvatarModal.style.display === 'flex') {
            displaySavedAvatars();
        }
    });
    observer.observe(originalAvatarModal, { attributes: true, attributeFilter: ['style'] });
    
    // ==================== EVENT LISTENERS DEL CHAT ====================
    
    // Tabs del panel derecho
    document.getElementById('tab-queue').addEventListener('click', () => {
        document.getElementById('tab-queue').classList.add('active');
        document.getElementById('tab-chat').classList.remove('active');
        document.getElementById('queue-panel').style.display = 'block';
        document.getElementById('chat-panel').style.display = 'none';
    });

    document.getElementById('tab-chat').addEventListener('click', () => {
        document.getElementById('tab-chat').classList.add('active');
        document.getElementById('tab-queue').classList.remove('active');
        document.getElementById('chat-panel').style.display = 'block';
        document.getElementById('queue-panel').style.display = 'none';
    });

    // Switch entre chat local y Twitch
    document.getElementById('chat-mode-switch').addEventListener('change', (e) => {
        isTwitchMode = e.target.checked;
        const label = document.getElementById('chat-mode-label');
        const localChat = document.getElementById('local-chat');
        const twitchChat = document.getElementById('twitch-chat');
        
        if (isTwitchMode) {
            label.textContent = t('twitch-chat');
            localChat.style.display = 'none';
            twitchChat.style.display = 'block';
        } else {
            label.textContent = t('local-chat');
            localChat.style.display = 'block';
            twitchChat.style.display = 'none';
        }
    });
    
    // Enviar mensaje de chat
    document.getElementById('send-chat-btn').addEventListener('click', sendChatMessage);

    document.getElementById('chat-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    });
    
    // Chat de Twitch
    document.getElementById('connect-twitch-btn').addEventListener('click', () => {
        const channelInput = document.getElementById('twitch-channel-input');
        const channel = channelInput.value.trim().toLowerCase();
        
        if (channel) {
            twitchChannel = channel;
            loadTwitchChat(channel);
        }
    });
});

function updateToolButtons() {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tool-${currentTool}`).classList.add('active');
}

// ==================== SISTEMA DE CHAT ====================

// Variables del chat
let isTwitchMode = false;
let twitchChannel = null;

// Utilidad para escapar HTML
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Chat Local - Enviar mensaje
function sendChatMessage() {
    const input = document.getElementById('chat-input');
    if (!input) {
        console.error('Chat input no encontrado');
        return;
    }
    
    const message = input.value.trim();
    
    if (message && currentUsername && currentRoomId) {
        console.log('Enviando mensaje:', message);
        socket.emit('chat-message', {
            roomId: currentRoomId,
            username: currentUsername,
            message: message,
            timestamp: Date.now()
        });
        input.value = '';
    } else {
        console.log('No se puede enviar:', { message, currentUsername, currentRoomId });
    }
}

// Mostrar mensaje en el chat
function displayChatMessage(data) {
    const messagesContainer = document.getElementById('chat-messages');
    if (!messagesContainer) {
        console.error('Contenedor de mensajes no encontrado');
        return;
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    const time = new Date(data.timestamp).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageDiv.innerHTML = `
        <div class="username">${data.username}</div>
        <div class="message-text">${escapeHtml(data.message)}</div>
        <div class="timestamp">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Cargar chat de Twitch
function loadTwitchChat(channel) {
    const setup = document.querySelector('.twitch-setup');
    const twitchContainer = document.getElementById('twitch-chat');
    
    // Ocultar setup
    setup.style.display = 'none';
    
    // Crear interfaz del chat
    const chatInterface = document.createElement('div');
    chatInterface.className = 'twitch-chat-interface';
            chatInterface.innerHTML = `
        <div class="twitch-channel-header">
            <div class="twitch-channel-info">
                <div class="twitch-logo">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#9146FF">
                        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                    </svg>
                </div>
                <div>
                    <div class="twitch-channel-name">${channel}</div>
                    <div class="twitch-channel-status">${t('twitch-chat')}</div>
                </div>
            </div>
            <button class="twitch-back-btn" onclick="document.querySelector('.twitch-setup').style.display='block'; this.closest('.twitch-chat-interface').remove();">
                ← ${t('change')}
            </button>
        </div>
        
        <div class="twitch-chat-content">
            <div class="twitch-info-box">
                <div class="twitch-info-icon">ℹ️</div>
                <div>
                    <div class="twitch-info-title">${t('external-window-required')}</div>
                    <div class="twitch-info-text">${t('twitch-restrictions')}</div>
                </div>
            </div>
            
            <button class="btn-twitch-open" onclick="window.open('https://www.twitch.tv/popout/${channel}/chat?popout=', 'twitch-chat', 'width=400,height=700,scrollbars=yes')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                </svg>
                ${t('open-twitch-chat')}
            </button>
            
            <div class="twitch-alternative">
                <p>${t('also-view')}</p>
                <a href="https://www.twitch.tv/${channel}" target="_blank" class="twitch-link">
                    twitch.tv/${channel} →
                </a>
            </div>
        </div>
    `;
    
    twitchContainer.appendChild(chatInterface);
    console.log('Twitch chat cargado para:', channel);
}

// ==================== FUNCIONES DE VIDEO ====================

// Extraer ID de video de YouTube
function extractVideoId(url) {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
}

// Obtener información del video
async function getVideoInfo(videoId) {
    try {
        // Usar oEmbed de YouTube (no requiere API key)
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        
        return {
            videoId: videoId,
            title: data.title,
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            duration: 'N/A', // La duración se obtendrá del player
            views: 'N/A' // Las visitas no están disponibles sin API key
        };
    } catch (error) {
        console.error('Error al obtener info del video:', error);
        return null;
    }
}

// Formatear duración de segundos a MM:SS
function formatDuration(seconds) {
    if (!seconds || seconds === 'N/A') return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Formatear número de visitas
function formatViews(views) {
    if (!views || views === 'N/A') return 'N/A';
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
}

