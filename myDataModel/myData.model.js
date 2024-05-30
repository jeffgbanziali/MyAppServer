const UserModel = require("../models/user.model");
const PostModel = require('../models/post.model');

const postModelisation = require("./metada.json")
const userModelisation = require("./users.json")

const tf = require('@tensorflow/tfjs');

const posts = [
    { id: 1, title: "Post 1", categories: ["Tech", "Programming"] },
    { id: 2, title: "Post 2", categories: ["Health", "Fitness"] },
    { id: 3, title: "Post 3", categories: ["Food", "Cooking"] },
    { id: 4, title: "Post 4", categories: ["Sex", "Drug"] },
    { id: 5, title: "Post 5", categories: ["Football", "Sport"] },
    { id: 6, title: "Post 6", categories: ["Cinema", "Serie"] },
    { id: 7, title: "Post 7", categories: ["Cinema", "Movie"] },
    { id: 8, title: "Post 8", categories: ["Game", "Video game"] },
    { id: 9, title: "Post 9", categories: ["Food", "Cooking"] },
    { id: 10, title: "Post 10", categories: ["Food", "Cooking"] },

];

const userInteractions = [
    { userId: 1, postId: 1, action: "like" },
    { userId: 1, postId: 2, action: "view" },
    { userId: 2, postId: 2, action: "like" },
    { userId: 2, postId: 4, action: "like" },
    { userId: 2, postId: 3, action: "like" },
    { userId: 1, postId: 6, action: "like" },
    { userId: 1, postId: 8, action: "like" },
    { userId: 2, postId: 8, action: "like" },
    { userId: 2, postId: 7, action: "like" },
    { userId: 2, postId: 5, action: "like" },
    { userId: 1, postId: 4, action: "like" },
    { userId: 1, postId: 15, action: "like" },
];

// Crée une fonction pour générer des recommandations pour un utilisateur donné
async function generateRecommendations(userId, userInteractions) {
    // Filtrer les interactions de l'utilisateur donné
    const userActions = userInteractions.filter(action => action.userId === userId);

    // Extraire les IDs des posts que l'utilisateur a aimés
    const likedPostIds = userActions.filter(action => action.action === "like").map(action => action.postId);

    // Regrouper les posts par catégorie
    const postsByCategory = {};
    postModelisation.forEach(post => {
        post.categories.forEach(category => {
            if (!postsByCategory[category]) {
                postsByCategory[category] = [];
            }
            postsByCategory[category].push(post);
        });
    });

    // Créer un vecteur de recommandation basé sur les catégories des posts aimés par l'utilisateur
    let recommendationVector = tf.zeros([posts.length]);
    likedPostIds.forEach(postId => {
        const post = postModelisation.find(post => post.id === postId);
        if (post) {
            post.categories.forEach(category => {
                const categoryPosts = postsByCategory[category];
                if (categoryPosts) {
                    categoryPosts.forEach(categoryPost => {
                        const index = categoryPost.id - 1; // Index de 0 à n-1
                        recommendationVector = tf.add(recommendationVector, tf.oneHot(index, posts.length));
                    });
                }
            });
        }
    });

    // Convertir le vecteur de recommandation en tableau JavaScript
    recommendationVector = await recommendationVector.array();

    // Trier les posts par score de recommandation décroissant
    const recommendations = [];
    for (let i = 0; i < recommendationVector.length; i++) {
        recommendations.push({ postId: i + 1, score: recommendationVector[i] });
    }
    recommendations.sort((a, b) => b.score - a.score);

    // Retourne les 10 meilleurs posts recommandés
    return recommendations.slice(0, 10).map(recommendation => posts.find(post => post.id === recommendation.postId));
}

// Exemple d'utilisation : Générer des recommandations pour l'utilisateur avec l'ID 1
generateRecommendations(1, userInteractions).then(recommendations => {
    //console.log("Recommandations pour l'utilisateur 1 :", recommendations);
}).catch(error => {
    console.error("Une erreur s'est produite :", error);
});

// Exemple d'utilisation : Générer des recommandations pour l'utilisateur avec l'ID 2
generateRecommendations(2, userInteractions).then(recommendations => {
    // console.log("Recommandations pour l'utilisateur 2 :", recommendations);
}).catch(error => {
    console.error("Une erreur s'est produite :", error);
});