const express = require('express');
require('dotenv').config({ path: './config/.env' });
require('./config/db');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/user.routes');
const postRoutes = require('./routes/post.routes');
const { checkUser, requireAuth } = require('./middleware/auth.middleware');
const app = express();

//middleware
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


//myAppServer
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});