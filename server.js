const express = require('express');
require('dotenv').config({ path: './config/.env' });
const bodyParser = require('./routes/user.routes');
const userRoutes = require('./routes/user.routes');
require('./config/db');
const app = express();



app.use(bodyParser.json());
app.use(bodyParser.unlencoded({ extended: true }));



//routes 
app.use('/api/user', userRoutes);








// server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});