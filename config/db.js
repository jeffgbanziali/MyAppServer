const mongoose = require('mongoose');

const connectToDatabase = async () => {
    try {
        await mongoose.connect(
            "mongodb+srv://" + process.env.DB_USER_PASS + "@jeff.0lid4ok.mongodb.net/test", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error(error);
    }
};

connectToDatabase();
