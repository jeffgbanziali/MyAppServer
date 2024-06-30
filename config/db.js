const mongoose = require('mongoose');

// Assurez-vous que la variable d'environnement est définie correctement
const dbUserPass = process.env.DB_USER_PASS;
if (!dbUserPass) {
    console.error('DB_USER_PASS environment variable is not set');
    process.exit(1);
}

const connectToDatabase = async () => {
    try {
        mongoose.set('strictQuery', false);

        // Connectez-vous à la base de données MongoDB
        await mongoose.connect(
            `mongodb+srv://${dbUserPass}@jeff.0lid4ok.mongodb.net/test`, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Failed to connect to MongoDB', error);
    }
};

connectToDatabase();
