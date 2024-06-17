const tf = require('@tensorflow/tfjs');
const UserModel = require('../models/user.model');
const PostModel = require('../models/post.model');
/*
// Fonction pour prétraiter les données des utilisateurs et des posts
async function preprocessData() {
    const usersData = await UserModel.find().lean();
    const postsData = await PostModel.find().lean();

    const usersMap = new Map();
    usersData.forEach(user => {
        usersMap.set(user._id.toString(), user);
    });

    const postsMap = new Map();
    postsData.forEach((post, index) => {
        post.index = index; // Ajouter un champ index unique à chaque post
        postsMap.set(post._id.toString(), post);
    });

    return { usersData, postsData, usersMap, postsMap };
}

// Fonction pour créer la matrice des interactions utilisateur-post
function createInteractionsMatrix(usersData, postsData) {
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

    return interactionsMatrix;
}

// Fonction pour définir et compiler le modèle
function defineAndCompileModel(inputShape) {
    const model = tf.sequential();
    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
        inputShape: [inputShape]
    }));
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: inputShape,
        activation: 'sigmoid'
    }));

    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

// Fonction pour entraîner le modèle
async function trainModel(model, interactionsTensor) {
    const epochs = 10;
    await model.fit(interactionsTensor, interactionsTensor, {
        epochs,
        shuffle: true,
        validationSplit: 0.1
    });
}

// Fonction pour générer les recommandations
function generateUserRecommendations(predictionsArray, usersData, postsData) {
    const recommendations = [];

    predictionsArray.forEach((userPredictions, userId) => {
        const user = usersData[userId];

        const userRecommendations = userPredictions.map((score, index) => {
            const post = postsData.find(post => post.index === index);
            return { ...post, score };
        });

        userRecommendations.sort((a, b) => b.score - a.score);
        console.log("My postData estl à ", userRecommendations[0].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[1].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[2].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[3].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[4].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[5].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[5].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[6].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[7].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[8].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[9].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[10].categories)
        console.log("---------------Pour la fin du bail--------------------------")

        const topRecommendations = userRecommendations.slice(0, 20);

        recommendations.push({ userId: user._id.toString(), recommendations: topRecommendations });
    });

    return recommendations;
}

// Fonction principale
async function generateRecommendations() {
    const { usersData, postsData } = await preprocessData();
    const interactionsMatrix = createInteractionsMatrix(usersData, postsData);
    const interactionsTensor = tf.tensor2d(interactionsMatrix);

    const model = defineAndCompileModel(postsData.length);
    await trainModel(model, interactionsTensor);

    const predictionsTensor = model.predict(interactionsTensor);
    const predictionsArray = await predictionsTensor.array();

    const recommendations = generateUserRecommendations(predictionsArray, usersData, postsData);

    return recommendations;
}*/


/*async function generateRecommendations() {

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
    const categoryMap = new Map();

    // Assign unique indices to each category
    postsData.forEach(post => {
        post.categories.forEach(category => {
            if (!categoryMap.has(category)) {
                categoryMap.set(category, categoryMap.size);
            }
        });
    });

    console.log("Mes catégories", categoryMap)

    usersData.forEach(user => {
        const userInteractions = new Array(postsData.length).fill(0);
        const categoryInteractions = new Array(categoryMap.size).fill(0);

        postsData.forEach((post, index) => {
            if (post.likers.includes(user._id.toString())) {
                userInteractions[index] = 1;
                post.categories.forEach(category => {
                    categoryInteractions[categoryMap.get(category)] = 1;
                });
            }
        });

        interactionsMatrix.push([...userInteractions, ...categoryInteractions]);



    });



    // Conversion de la matrice en tenseur TensorFlow
    const interactionsTensor = tf.tensor2d(interactionsMatrix);

    // Vérifiez que les dimensions de l'entrée et de la cible sont les mêmes
    const inputShape = interactionsTensor.shape[1];

    // Définition et compilation du modèle
    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: [inputShape] }));
    model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
    model.add(tf.layers.dense({ units: inputShape, activation: 'sigmoid' }));
    model.compile({ optimizer: 'adam', loss: 'binaryCrossentropy', metrics: ['accuracy'] });

    // Entraînement du modèle avec les données d'interactions
    const epochs = 10;
    await model.fit(interactionsTensor, interactionsTensor, { epochs, shuffle: true, validationSplit: 0.1 });

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
            const post = postsData[index];
            return { ...post, score }; // Ajoute le score directement à l'objet post
        });

        console.log("My postData estl à ", userRecommendations[0].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[1].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[2].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[3].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[4].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[5].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[5].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[6].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[7].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[8].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[9].categories)
        console.log("------------------------------------------------------")
        console.log("My postData estl à ", userRecommendations[10].categories)
        console.log("---------------Pour la fin du bail--------------------------")



        // Tri des recommandations par score décroissant
        userRecommendations.sort((a, b) => b.score - a.score);

        // Récupération des 20 meilleures recommandations pour cet utilisateur
        const topRecommendations = userRecommendations.slice(0, 20);
        recommendations.push({ userId: user._id.toString(), recommendations: topRecommendations });
    });

    return recommendations;
}*/


// Fonction pour prétraiter les données des utilisateurs et des posts
async function preprocessData() {
    const usersData = await UserModel.find().lean();
    const postsData = await PostModel.find().lean();

    const usersMap = new Map();
    usersData.forEach(user => {
        usersMap.set(user._id.toString(), user);
    });

    const postsMap = new Map();
    postsData.forEach((post, index) => {
        post.index = index; // Ajouter un champ index unique à chaque post
        postsMap.set(post._id.toString(), post);
    });

    return { usersData, postsData, usersMap, postsMap };
}

// Fonction pour créer la matrice des interactions utilisateur-post
function createInteractionsMatrix(usersData, postsData) {
    const interactionsMatrix = [];
    const categorySet = new Set(postsData.map(post => post.category));
    const categoryArray = Array.from(categorySet);
    const categoryIndexMap = new Map(categoryArray.map((category, index) => [category, index]));

    usersData.forEach(user => {
        const userInteractions = new Array(postsData.length).fill(0);
        const categoryInteractions = new Array(categoryArray.length).fill(0);

        postsData.forEach((post, index) => {
            if (post.likers.includes(user._id.toString())) {
                userInteractions[index] = 1;
                categoryInteractions[categoryIndexMap.get(post.category)] = 1;
            }
        });

        interactionsMatrix.push([...userInteractions, ...categoryInteractions]);
    });

    return { interactionsMatrix, categoryArray };
}

// Fonction pour définir et compiler le modèle
function defineAndCompileModel(inputShape) {
    const model = tf.sequential();
    model.add(tf.layers.dense({
        units: 64,
        activation: 'relu',
        inputShape: [inputShape]
    }));
    model.add(tf.layers.dense({
        units: 32,
        activation: 'relu'
    }));
    model.add(tf.layers.dense({
        units: inputShape,
        activation: 'sigmoid'
    }));

    model.compile({
        optimizer: 'adam',
        loss: 'binaryCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}

// Fonction pour entraîner le modèle
async function trainModel(model, interactionsTensor) {
    const epochs = 10;
    await model.fit(interactionsTensor, interactionsTensor, {
        epochs,
        shuffle: true,
        validationSplit: 0.1
    });
}

// Fonction pour générer les recommandations
function generateUserRecommendations(predictionsArray, usersData, postsData, categoryArray) {
    const recommendations = [];
    const categoryIndexMap = new Map(categoryArray.map((category, index) => [category, index]));

    predictionsArray.forEach((userPredictions, userId) => {
        const user = usersData[userId];


        // Diviser les prédictions en postScores et categoryScores
        const postScores = userPredictions.slice(0, postsData.length);
        const categoryScores = userPredictions.slice(postsData.length);

        // Générer les recommandations basées sur les scores des posts
        const userRecommendations = postScores.map((score, index) => {
            const post = postsData.find(post => post.index === index);
            if (post) {
                // Ajuster le score du post en fonction du score de la catégorie
                const categoryScore = categoryScores[categoryIndexMap.get(post.category)];
                const adjustedScore = score * categoryScore;
                return { ...post, score: adjustedScore };
            }
            return null;
        }).filter(post => post !== null);

        // Filtrer les posts déjà likés par l'utilisateur
        const filteredRecommendations = userRecommendations.filter(post => !post.likers.includes(user._id.toString()));

        // Trier les recommandations par score décroissant
        filteredRecommendations.sort((a, b) => b.score - a.score);

        // Récupérer les 20 meilleures recommandations pour cet utilisateur
        const topRecommendations = filteredRecommendations.slice(0, 20);


        recommendations.push({ userId: user._id.toString(), recommendations: topRecommendations });
    });

    return recommendations;
}

// Fonction principale
async function generateRecommendations() {
    const { usersData, postsData } = await preprocessData();
    const { interactionsMatrix, categoryArray } = createInteractionsMatrix(usersData, postsData);
    const interactionsTensor = tf.tensor2d(interactionsMatrix);

    const model = defineAndCompileModel(interactionsMatrix[0].length);
    await trainModel(model, interactionsTensor);

    const predictionsTensor = model.predict(interactionsTensor);
    const predictionsArray = await predictionsTensor.array();

    const recommendations = generateUserRecommendations(predictionsArray, usersData, postsData, categoryArray);

    return recommendations;
}

module.exports = generateRecommendations;
