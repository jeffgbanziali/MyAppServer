const tf = require('@tensorflow/tfjs');
const UserModel = require('../models/user.model');
const PostModel = require('../models/post.model');

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



    // Conversion de la matrice en tenseur TensorFlow
    const interactionsTensor = tf.tensor2d(interactionsMatrix);

    // Définition et compilation du modèle
    const model = tf.sequential();
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

    // Entraînement du modèle avec les données d'interactions
    const epochs = 10;
    await model.fit(interactionsTensor, interactionsTensor, {
        epochs,
        shuffle: true,
        validationSplit: 0.1
    });

    // Récupération des prédictions du modèle pour les interactions utilisateur-post
    const predictionsTensor = model.predict(interactionsTensor);

    // Conversion des tenseurs TensorFlow en tableaux JavaScript
    const predictionsArray = await predictionsTensor.array();

    // Génération des recommandations personnalisées pour chaque utilisateur
    const recommendations = [];

    predictionsArray.forEach((userPredictions, userId) => {
        // Récupération de l'objet utilisateur correspondant
        const user = usersData[userId];

        // Utilisation de l'ID d'utilisateur dans les recommandations
        const userRecommendations = userPredictions.map((score, index) => {
            const post = postsData.find(post => post.index === index);
            // console.log("Mes posts sont là", post);
            return { ...post, score }; // Ajoute le score directement à l'objet post
        });




        // Tri des recommandations par score décroissant
        userRecommendations.sort((a, b) => b.score - a.score);

        // Récupération des 10 meilleures recommandations pour cet utilisateur
        const topRecommendations = userRecommendations.slice(0, 20);

        recommendations.push({ userId: user._id.toString(), recommendations: topRecommendations });
    });

    return recommendations;
}

module.exports = generateRecommendations;
