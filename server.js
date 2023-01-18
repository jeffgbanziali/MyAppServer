const express = require('express');
require('dotenv').config({ path: './config/.env' });
require('./config/db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const conversationRoutes = require('./routes/conversations.routes');
const messageRoutes = require('./routes/messages.route');
const { checkUser, requireAuth } = require('./middleware/auth.middleware');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();

const corsOptions = {
    origin: process.env.CLIENT_URL,
    credentials: true,
    'allowedHeaders': ['sessionId', 'Content-Type'],
    'exposedHeaders': ['sessionId'],
    'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
    'preflightContinue': false

}

//socket.io
const server = http.createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('a user connected =>', socket.id);

    //socket event
    socket.on('join_room', (room) => {
        socket.join(room);
        console.log('user joined room ', room);
    });

    socket.on('send_message', (message) => {
        console.log('message sending', message);
        io.to(message.room).emit('new_message', {
            id: new Date().getTime(),
            ...message
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected', socket.id);
    });
});


//middleware
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// jwt
app.get('*', checkUser);
app.get('/jwtid', requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id)
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