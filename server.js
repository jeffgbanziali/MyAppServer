const express = require("express");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const storyRoutes = require("./routes/story.route");
const videoRéelsRoutes = require("./routes/réels.route");
const conversationRoutes = require("./routes/conversation.route");
const messageRoutes = require("./routes/message.route");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const cors = require("cors");
const http = require("http");

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  preflightContinue: false,
};

//socket.io
//socket.io
const io = require("socket.io")(8900, {
  cors: {
    origin: "http://192.168.0.14:3000",
  },
});

let users = [];

const addUser = (id, socketId) => {
  !users.some((user) => user.id === id) &&
    users.push({ id, socketId });
  console.log("Users after adding:", users);
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
  console.log("Users after removing:", users);
};

const getUser = (id) => {
  console.log("Affiche toi :", id);
  const user = users.find((user) => user.id === id);
  console.log("User trouvé :", user);
  console.log("Users :", users);
  return user;
};

io.on("connection", (socket) => {
  //when ceonnect
  console.log("Utilisateur  connecté !!!!");

  //take userId and socketId from user
  socket.on("addUser", (id) => {
    console.log("User added:", id, socket.id);
    addUser(id, socket.id);
    io.emit("getUsers", users);
  });

  //send and get message
  socket.on("sendMessage", ({ senderId, receiverId, text, attachment }) => {
    console.log("Affiche toi :", receiverId);
    const user = getUser(receiverId);

    console.log("User:", user);
    if (user && user.socketId) {
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
        attachment,
      });
    } else {
      console.log("Utilisateur non trouvé ou socketId non défini.");
    }
  });




  //when disconnect
  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté !!!!");
    removeUser(socket.id);
    io.emit("getUsers", users);
    console.log("Users after disconnect:", users);
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
app.use("/api/stories", storyRoutes);
app.use("/api/conversation", conversationRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/videoReels", videoRéelsRoutes);

//myAppServer

const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
