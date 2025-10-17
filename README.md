# PlugDJ Clone - Reproductor Colaborativo

Una aplicación web que permite a múltiples usuarios unirse a una sala y compartir videos de YouTube en una cola de reproducción sincronizada en tiempo real.

## 🎵 Características

- **Reproductor de YouTube integrado** - Reproduce videos directamente en la aplicación
- **Sistema multi-usuario** - Múltiples personas pueden unirse a la misma sala
- **Cola de reproducción compartida** - Los videos se organizan en una cola visible para todos
- **Sincronización en tiempo real** - Todos los usuarios ven el mismo video al mismo tiempo
- **Sistema de salas** - Cada URL única crea una sala diferente
- **Interfaz moderna** - Diseño inspirado en plug.dj con colores vibrantes
- **Gestión de usuarios** - Ve quién está en línea en tiempo real

## 📋 Requisitos

- Node.js (versión 14 o superior)
- npm (viene con Node.js)

## 🚀 Instalación

1. Abre una terminal en la carpeta del proyecto

2. Instala las dependencias:
```bash
npm install
```

## ▶️ Uso

1. Inicia el servidor:
```bash
npm start
```

2. Abre tu navegador en:
```
http://localhost:3000
```

3. Ingresa tu nombre de usuario

4. ¡Comienza a agregar videos de YouTube!

## 🔗 Compartir con amigos

1. Haz clic en el botón "📋 Copiar Link" en la parte superior
2. Comparte el link con tus amigos
3. Todos verán el mismo contenido sincronizado

## 🎮 Cómo usar

1. **Agregar videos**: Haz clic en "➕ Agregar Video" y pega un enlace de YouTube
2. **Cola de reproducción**: Los videos se reproducen automáticamente en orden
3. **Saltar videos**: Usa el botón "⏭️ Saltar" para pasar al siguiente video
4. **Ver usuarios**: El panel izquierdo muestra todos los usuarios conectados
5. **Gestionar cola**: Elimina videos de la cola con el botón "×"

## 🛠️ Tecnologías utilizadas

- **Backend**: Node.js + Express
- **WebSockets**: Socket.io para comunicación en tiempo real
- **Reproductor**: YouTube IFrame API
- **Frontend**: HTML5, CSS3, JavaScript vanilla

## 📱 Responsive

La aplicación es totalmente responsive y se adapta a diferentes tamaños de pantalla (desktop, tablet, móvil).

## 🔧 Modo desarrollo

Para desarrollo con auto-reload:
```bash
npm run dev
```
(Requiere instalar nodemon)

## 🌐 Despliegue en producción

Puedes desplegar esta aplicación en servicios como:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS

Recuerda configurar el puerto usando variables de entorno si es necesario.

## 📝 Notas

- Los videos deben ser de YouTube y estar disponibles públicamente
- La sincronización puede variar ligeramente dependiendo de la conexión de cada usuario
- Las salas se eliminan automáticamente cuando todos los usuarios se desconectan

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Siéntete libre de mejorar el código.

## 📄 Licencia

MIT License - Siéntete libre de usar este proyecto como desees.

---

**Disfruta compartiendo música y videos con tus amigos! 🎵**

