const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;

//user model
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select(
    "-password" + " -confirmPassword"
  );
  res.status(200).json(users);
};

//user information
module.exports.userInfo = async (req, res) => {
  if (!ObjectID.isValid(req.params.id)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    const user = await UserModel.findById(req.params.id).select(
      "-password" + " -confirmPassword"
    );
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    let imageUrl = null;
    if (req.body.picture) {
      imageUrl = req.body.picture;
    }
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      { $set: { picture: imageUrl } },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log('Successful profile photo update. New picture :', updatedUser.picture);
    res.status(200).json({
      _id: updatedUser._id,
      picture: updatedUser.picture,
    });

  } catch (err) {
    console.error('Error during profile update:', err);
    let errorMessage = 'An error occurred during profile update.';
    if (err.message) errorMessage = err.message;

    const errors = uploadErrors(errorMessage);
    res.status(500).json({ errors });
  }
};

//user update
module.exports.updateBio = async (req, res) => {

  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          bio: req.body.bio,
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log('Successful bio update. New bio :', user.bio);
    return res.status(200).send(user);
  } catch (err) {
    console.error('Error updating bio :', err);
    return res.status(500).json({ message: err });
  }
};


module.exports.updatePseudo = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("Id unknow : " + req.params.id);
  try {
    const user = await UserModel.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: { pseudo: req.body.pseudo },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    console.log('Successful psueod update. New pseudo :', user.pseudo);
    return res.status(200).send(user);
  } catch (err) {
    console.error('Error updating pseudo :', err);
    return res.status(500).json({ message: err });
  }
}

module.exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  try {
    // Trouver l'utilisateur par ID
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Si le mot de passe est fourni dans les données de mise à jour, le hacher avant de sauvegarder
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // Mettre à jour les informations de l'utilisateur
    Object.assign(user, updateData);


    await user.save();

    console.log('Ou est la mise à jour', user)

    res.status(200).json({ message: 'Informations mises à jour avec succès', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour des informations', error });
  }
};


// user delete

module.exports.deleteUser = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await UserModel.remove({ _id: req.params.id }).exec();
    res.status(200).json({ message: "Successfully deleted." });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};

// get friends

module.exports.getFriends = async (req, res) => {
  try {
    if (typeof req.params.id === "undefined") {
      return res.status(400).json({ error: "Missing user id" });
    }

    const user = await UserModel.findById(req.params.id);
    const friendList = [];

    const allUsersExceptCurrentUser = await UserModel.find({
      _id: { $ne: new ObjectID(req.params.id) },
    });

    friendList.push(
      ...allUsersExceptCurrentUser.map((friend) => ({
        _id: friend._id,
        pseudo: friend.pseudo,
        picture: friend.picture,
      }))
    );


    await Promise.all(
      user.following.map(async (friendId) => {
        try {

          const friend = await UserModel.findById(new ObjectID(friendId));

          if (friend) {
            const { _id, pseudo, picture } = friend;
            friendList.push({ _id, pseudo, picture });
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'ami :", error);
        }
      })
    );

    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(error);
    console.log("error");
    console.log(error);
  }
};


module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  ) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    const follower = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );
    if (!follower) {
      return res.status(404).json({ message: "Follower not found." });
    }

    const following = await UserModel.findByIdAndUpdate(
      req.body.idToFollow,
      { $addToSet: { followers: req.params.id } },
      { new: true, upsert: true }
    );
    if (!following) {
      return res.status(404).json({ message: "Following not found." });
    }

    return res.status(200).json({ message: "Successfully followed." });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};


module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  ) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    const follower = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true }
    );
    if (!follower) {
      return res.status(404).json({ message: "Follower not found." });
    }

    const following = await UserModel.findByIdAndUpdate(
      req.body.idToUnfollow,
      { $pull: { followers: req.params.id } },
      { new: true, upsert: true }
    );
    if (!following) {
      return res.status(404).json({ message: "Following not found." });
    }

    return res.status(200).json({ message: "Successfully unfollowed." });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
};


module.exports.addFavoritePost = async (req, res) => {
  const { userId, postId } = req.body;

  // Vérifie si les ID sont valides
  if (!ObjectID.isValid(userId) || !ObjectID.isValid(postId)) {
    return res.status(400).send("ID invalide");
  }

  try {
    // Vérifie si l'utilisateur existe
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Vérifie si le post existe déjà dans les favoris
    const postExists = user.favoritePost.includes(postId);
    if (postExists) {
      return res.status(409).send("Le post est déjà dans les favoris");
    }

    // Ajoute le post aux favoris de l'utilisateur
    user.favoritePost.push(postId);
    await user.save();

    res.status(200).send("Post ajouté aux favoris avec succès");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

module.exports.removeFavoritePost = async (req, res) => {
  const { userId, postId } = req.body;

  // Vérifie si les ID sont valides
  if (!ObjectID.isValid(userId) || !ObjectID.isValid(postId)) {
    return res.status(400).send("ID invalide");
  }

  try {
    // Vérifie si l'utilisateur existe
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Retire le post des favoris de l'utilisateur
    user.favoritePost = user.favoritePost.filter(fav => fav !== postId);
    await user.save();

    res.status(200).send("Post retiré des favoris avec succès");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};


module.exports.savedPost = async (req, res) => {
  const { userId, postId } = req.body;

  // Vérifie si les ID sont valides
  if (!ObjectID.isValid(userId) || !ObjectID.isValid(postId)) {
    return res.status(400).send("ID invalide");
  }

  try {
    // Vérifie si l'utilisateur existe
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Vérifie si le post existe déjà dans les posts enregistrés
    const postExists = user.savedPost.includes(postId);
    if (postExists) {
      return res.status(409).send("Le post est déjà enregistré");
    }

    // Enregistre le post aux favoris de l'utilisateur
    user.savedPost.push(postId);
    await user.save();

    res.status(200).send("Post enregistré avec succès");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

/*module.exports.removeSavedPost = async (req, res) => {
  const { userId, postId } = req.body;

  // Vérifie si les ID sont valides
  if (!ObjectID.isValid(userId) || !ObjectID.isValid(postId)) {
    return res.status(400).send("ID invalide");
  }

  try {
    // Vérifie si l'utilisateur existe
    const user = await UserModel.findById(userId);
    if (!user) 
      return res.status(404).send("Utilisateur non trouvé");
    }

    // Retire le post de ceux enregistrés par l'utilisateur
    user.savedPost = user.savedPost.filter(fav => fav !== postId);
    await user.save();

    res.status(200).send("Post retiré de ceux enregistrés avec succès");
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};*/


