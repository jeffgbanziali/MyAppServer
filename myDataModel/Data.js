const tf = require('@tensorflow/tfjs');

// Charger les données des utilisateurs et des posts à partir des fichiers JSON
const postsData = require('./metada.json');
const usersData = require('./users.json');

async function generateRecommendations() {
    // Prétraitement des données

    // Créer une liste des utilisateurs avec leur ID comme clé
    const usersMap = new Map();
    usersData.forEach(user => {
        usersMap.set(user.userId, user);
    });

    // Créer une liste des posts avec leur ID comme clé
    const postsMap = new Map();
    postsData.forEach((post, index) => {
        post._id = index; // Ajouter un postId unique à chaque post
        postsMap.set(index, post);
    });

    // Créer une matrice des interactions utilisateur-post avec des 0 et des 1
    const interactionsMatrix = [];
    usersData.forEach(user => {
        const userInteractions = new Array(postsData.length).fill(0);
        postsData.forEach((post, index) => {
            if (post.likers.includes(user.userId)) {
                userInteractions[index] = 1;
            }
        });
        interactionsMatrix.push(userInteractions);
    });

    // Convertir la matrice en tenseur TensorFlow
    const interactionsTensor = tf.tensor2d(interactionsMatrix);

    // Définir et compiler le modèle
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

    // Entraîner le modèle avec les données d'interactions
    const epochs = 10;
    await model.fit(interactionsTensor, interactionsTensor, {
        epochs,
        shuffle: true,
        validationSplit: 0.1
    });

    // Obtenir les prédictions du modèle pour les interactions utilisateur-post
    const predictionsTensor = model.predict(interactionsTensor);

    // Convertir les tenseurs TensorFlow en tableaux JavaScript
    const predictionsArray = await predictionsTensor.array();

    // Générer des recommandations personnalisées pour chaque utilisateur
    const recommendations = [];
    predictionsArray.forEach((userPredictions, userId) => {
        // Créer un tableau d'objets { postId: score } pour chaque utilisateur
        const userRecommendations = userPredictions.map((score, postId) => ({ _id: postId, score: score }));

        // Trier les recommandations par score décroissant
        userRecommendations.sort((a, b) => b.score - a.score);

        // Récupérer les 10 meilleures recommandations pour cet utilisateur
        const topRecommendations = userRecommendations.slice(0, 10);

        // Ajouter les recommandations à la liste globale des recommandations
        recommendations.push({ userId: userId, recommendations: topRecommendations });
    });

    console.log("voici mes recommandations", recommendations);

    return recommendations;
}

module.exports = generateRecommendations;
