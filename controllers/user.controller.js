const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const router = require("express").Router();

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

//user update
module.exports.updateUser = async (req, res) => {
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
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).json({ message: err });
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
    const friends = await Promise.all(
      user.following.map((friendId) => {
        return UserModel.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, pseudo, picture } = friend;
      friendList.push({ _id, pseudo, picture });
      console.log(req.params.id);
    });
    res.status(200).json(friendList);
  } catch (error) {
    res.status(500).json(error);
    console.log("error");
    console.log(error);
  }
};

// GET /users/:id/following
module.exports.follow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToFollow)
  ) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    // Ajouter à la liste des followers
    const follower = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { following: req.body.idToFollow } },
      { new: true, upsert: true }
    );
    if (!follower) {
      return res.status(404).json({ message: "Follower not found." });
    }

    // Ajouter à la liste des followings
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

// GET /users/:id/unfollow
module.exports.unfollow = async (req, res) => {
  if (
    !ObjectID.isValid(req.params.id) ||
    !ObjectID.isValid(req.body.idToUnfollow)
  ) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    // Retirer de la liste des followers
    const follower = await UserModel.findByIdAndUpdate(
      req.params.id,
      { $pull: { following: req.body.idToUnfollow } },
      { new: true, upsert: true }
    );
    if (!follower) {
      return res.status(404).json({ message: "Follower not found." });
    }

    // Retirer de la liste des followings
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

// Fonction de recherche d'utilisateurs

exports.searchUsers = async (req, res) => {
  try {
    // Recherchez tous les utilisateurs dans votre base de données
    const searchResults = await UserModel.find();

    res.json(searchResults);
  } catch (error) {
    console.error("Erreur de recherche d'utilisateurs :", error);
    res.status(500).json({ error: "Erreur de recherche d'utilisateurs" });
  }
};
