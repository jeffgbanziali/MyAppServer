const tf = require('@tensorflow/tfjs-node');
const UserModel = require('../models/user.model');
const PostModel = require('../models/post.model');
const MODEL_PATH = 'file://./savedModel/model'

async function generateRecommendations() {
    // Prétraitement des données
    const usersData = await UserModel.find().lean();
    const postsData = await PostModel.find().lean();

    // Création d'une liste des utilisateurs avec leur ID comme clé
    const usersMap = new Map();
    usersData.forEach(user => {
        usersMap.set(user._id.toString(), user);
    });

    // Création d'une liste des posts avec leur ID comme clé
    const postsMap = new Map();
    postsData.forEach((post, index) => {
        post.index = index; // Ajouter un champ index unique à chaque post
        postsMap.set(post._id.toString(), post);
    });

    // Création d'une matrice des interactions utilisateur-post avec des 0 et des 1
    const interactionsMatrix = [];
    usersData.forEach(user => {
        const userInteractions = new Array(postsData.length).fill(0);
        postsData.forEach((post, index) => {
            if (post.likers.includes(user._id.toString())) {
                userInteractions[index] = 1;
            }
        });
        interactionsMatrix.push(userInteractions);
    });

    // Chargement ou entraînement du modèle
    let model;
    try {
        model = await tf.loadLayersModel(MODEL_PATH);
    } catch (error) {
        console.log('Modèle non trouvé, entraînement d\'un nouveau modèle.');
        model = tf.sequential();
        model.add(tf.layers.dense({
            units: 64,
            activation: 'relu',
            inputShape: [postsData.length]
        }));
        model.add(tf.layers.dense({
            units: 32,
            activation: 'relu'
        }));
        model.add(tf.layers.dense({
            units: postsData.length,
            activation: 'sigmoid'
        }));

        model.compile({
            optimizer: 'adam',
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });

        const interactionsTensor = tf.tensor2d(interactionsMatrix);
        const epochs = 10;
        await model.fit(interactionsTensor, interactionsTensor, {
            epochs,
            shuffle: true,
            validationSplit: 0.1
        });

        await model.save(MODEL_PATH);
    }

    // Récupération des prédictions du modèle pour les interactions utilisateur-post
    const interactionsTensor = tf.tensor2d(interactionsMatrix);
    const predictionsTensor = model.predict(interactionsTensor);
    const predictionsArray = await predictionsTensor.array();

    // Génération des recommandations personnalisées pour chaque utilisateur
    const recommendations = [];
    predictionsArray.forEach((userPredictions, userId) => {
        const user = usersData[userId];
        const userRecommendations = userPredictions.map((score, index) => {
            const post = postsData.find(post => post.index === index);
            return { ...post, score };
        });

        userRecommendations.sort((a, b) => b.score - a.score);
        const topRecommendations = userRecommendations.slice(0, 20);
        recommendations.push({ userId: user._id.toString(), recommendations: topRecommendations });
    });

    return recommendations;
}

module.exports = generateRecommendations;
