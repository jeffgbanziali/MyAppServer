const express = require('express');
require('dotenv').config({ path: './config/.env' });
const userRoutes = require('./routes/user.routes');
require('./config/db');
const app = express();




//routes 
app.use('/api/user', userRoutes);








// server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});