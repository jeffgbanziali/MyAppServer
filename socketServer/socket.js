const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:4000", // L'URL de votre application React
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Utilisateur connecté');
  
  
  });