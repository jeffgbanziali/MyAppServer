const express = require("express");
require("dotenv").config({ path: "./config/.env" });
require("./config/db");
const bodyParser = require("body-parser");
const passport = require('passport');
const passportSetup = require('./config/passport');
const { Server } = require("socket.io");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const userRoutes = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const storyRoutes = require("./routes/story.route");
const videoRéelsRoutes = require("./routes/réels.route");
const conversationRoutes = require("./routes/conversation.route");
const messageRoutes = require("./routes/message.route");
const notificationRouter = require("./routes/notification.route")
const generateRecommendations = require('./myDataModel/Data');
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const cors = require("cors");
const http = require("http");

const chatSocket = require("./socketServer/socket");

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
const io = new Server(8900, {
  cors: {
    origin: "http://192.168.0.14:3000",
  },
});

chatSocket(io);
app.set('view engine', 'ejs');

//middleware
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieSession({
  name: "session",
  keys: ["cyberwolve"],
  maxAge: 24 * 60 * 60 * 100
}));

// Utilisez passportSetup pour initialiser Passport.js
app.use(passport.initialize());
app.use(passport.session());

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
app.use('/api/notifications', notificationRouter);



//myAppServer
const server = http.createServer(app);
server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
