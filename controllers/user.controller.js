const UserModel = require("../models/user.model");
const ObjectID = require("mongoose").Types.ObjectId;
const router = require("express").Router();


//user model
module.exports.getAllUsers = async (req, res) => {
  const users = await UserModel.find().select("-password" + " -confirmPassword");
  res.status(200).json(users);
};



//user information
module.exports.userInfo = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  UserModel.findById(req.params.id, (err, docs) => {
    if (!err) res.send(docs);
    else console.log("ID unknown : " + err);
  }).select("-password" + " -confirmPassword");
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
      { new: true, upsert: true, setDefaultsOnInsert: true },
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
  }
  catch (err) {
    return res.status(500).json({ message: err });
  }
};


//follow
module.exports.follow = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToFollow)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    // add to the follower list
    const user = await UserModel.findByIdAndUpdate(req.params.id, { $addToSet: { following: req.body.idToFollow } }, { new: true, upsert: true });

    // add to following list
    await UserModel.findByIdAndUpdate(req.body.idToFollow, { $addToSet: { followers: req.params.id } }, { new: true, upsert: true });

    console.log(req.body.idToFollow);
    res.send(user);
  } catch (err) {
    return res.status(500).json({ message: err });
    console.log(err);
  }
};

//unfollow

module.exports.unfollow = async (req, res) => {
  if (!ObjectID.isValid(req.params.id) || !ObjectID.isValid(req.body.idToUnfollow)) {
    return res.status(400).send("ID unknown : " + req.params.id);
  }

  try {
    // remove from the follower list
    const user = await UserModel.findByIdAndUpdate(req.params.id, { $pull: { following: req.body.idToUnfollow } }, { new: true });

    // remove from following list
    await UserModel.findByIdAndUpdate(req.body.idToUnfollow, { $pull: { followers: req.params.id } }, { new: true });

    console.log(req.body.idToUnfollow);
    res.send(user);
  } catch (err) {
    return res.status(500).json({ message: err });
    console.log(err);
  }
}
