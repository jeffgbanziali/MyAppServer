const jwt = require("jsonwebtoken");
const UserModel = require("../models/user.model");

module.exports.checkUser = async (req, res, next) => {
  const token = req.cookies.jwt;

  try {
    if (token) {
      // Vérifier la validité du token
      const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET);

      // Récupérer l'utilisateur à partir de la base de données
      const user = await UserModel.findById(decodedToken.id);

      if (user) {
        // Définir l'utilisateur dans res.locals
        res.locals.user = user;
        console.log("User found:", user.pseudo);
      } else {
        // Aucun utilisateur trouvé
        console.log("User not found for ID:", decodedToken.id);
      }
    } else {
      // Aucun token trouvé, définir l'utilisateur sur null
      res.locals.user = null;
    }

    // Passer à la fonction middleware suivante
    next();
  } catch (err) {
    // Gérer les erreurs lors de la vérification du token
    console.error("Error during token verification:", err);

    // Définir l'utilisateur sur null et supprimer le cookie JWT
    res.locals.user = null;
    res.cookie("jwt", "", { maxAge: 1 });

    // Passer à la fonction middleware suivante
    next();
  }
};

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.jwt;

  try {
    if (token) {
      // Vérifier la validité du token
      const decodedToken = await jwt.verify(token, process.env.TOKEN_SECRET);

      // Afficher l'ID de l'utilisateur si le token est vérifié
      console.log("Token verified. User ID:", decodedToken.id);

      // Passer à la fonction middleware suivante
      next();
    } else {
      // Aucun token trouvé, renvoyer une réponse d'erreur
      console.log("No token");
      res.status(401).json('No token');
    }
  } catch (err) {
    // Gérer les erreurs lors de la vérification du token
    console.error("Error during token verification:", err);
    res.status(401).json('Token verification error');
  }
};
