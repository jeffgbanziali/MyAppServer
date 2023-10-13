const express = require("express");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const conversationRoutes = require("./routes/conversation.route");
const messageRoutes = require("./routes/message.route");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000", // L'URL de votre application React
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  preflightContinue: false,
};

//socket.io

  const server = http.createServer(app);

const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000", // L'URL de votre application React
      methods: ["GET", "POST"]
    }
  });
  
  io.on('connection', (socket) => {
    console.log('Utilisateur connecté');
  
    // Gérer les événements de chat ici
    socket.on('chat message', (msg) => {
      io.emit('chat message', msg); // Diffuse le message à tous les utilisateurs connectés
    });
  
    // Ajoute d'autres événements de chat selon tes besoins
  
    socket.on('disconnect', () => {
      console.log('Utilisateur déconnecté');
    });
  });


//middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

//routes

app.use("/api/user", userRoutes);
app.use("/api/post", postRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/message", messageRoutes);

//myAppServer
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
