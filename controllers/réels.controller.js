const VideoRéelsModel = require("../models/réels.model");
const UserModel = require("../models/user.model");
const { uploadErrors } = require("../utils/errors.utils");
const ObjectID = require("mongoose").Types.ObjectId;

module.exports.readVideoRéels = (req, res) => {
  VideoRéelsModel.find((err, docs) => {
    if (!err) res.send(docs);
    else console.log("Error to get data : " + err);
  }).sort({ createdAt: -1 });
};


module.exports.readVideoRéelsById = async (req, res) => {
  try {
    const userId = req.params.id;

    const userPosts = await VideoRéelsModel.find({ posterId: userId }).sort({ createdAt: -1 });

    res.status(200).json(userPosts);
  } catch (err) {
    console.error('Error while getting user posts:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports.createVideoRéels = async (req, res) => {
  try {
    let mediaUrl = null;

    // Vérifie si le chemin de la vidéo a été envoyé depuis le client
    if (req.body.videoPath) {
      mediaUrl = req.body.videoPath;
    }

    // Création d'une nouvelle instance du modèle de videoRéels
    const newVideoRéels = new VideoRéelsModel({
      posterId: req.body.posterId,
      music: req.body.music || "Default Music", // Valeur par défaut pour le champ music
      description: req.body.description ,
      videoPath: mediaUrl || "Default Video Path", // Valeur par défaut pour le champ videoPath
      likers: [],
      comments: [],
      views: [],
      viewers: [],
    });

    const savedVideoRéels = await newVideoRéels.save();
    console.log('VideoRéels saved to MongoDB:', savedVideoRéels);
    res.status(201).json({
      _id: savedVideoRéels._id,
      posterId: savedVideoRéels.posterId,
      music: savedVideoRéels.music,
      description: savedVideoRéels.description,
      videoPath: savedVideoRéels.videoPath,
      likers: savedVideoRéels.likers,
      comments: savedVideoRéels.comments,
      views: savedVideoRéels.views,
      viewers: savedVideoRéels.viewers,
      createdAt: savedVideoRéels.createdAt,
      updatedAt: savedVideoRéels.updatedAt,
    });
  } catch (err) {
    console.error('Error during VideoRéels creation:', err);
    let errorMessage = 'An error occurred during VideoRéels creation.';
    if (err.message) errorMessage = err.message;

    const errors = uploadErrors(errorMessage);
    res.status(500).json({ errors });
  }
};


module.exports.likeVideoRéels = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    await VideoRéelsModel.findByIdAndUpdate(
      req.params.id,
      {
        $addToSet: { likers: req.body.id },
      },
      { new: true }
    )
      .then((data) => {
        UserModel.findByIdAndUpdate(
          req.body.id,
          {
            $addToSet: { likes: req.params.id },
          },
          { new: true }
        )
          .then((data) => res.send(data))
          .catch((err) => res.status(501).send({ message: err }));
      })
      .catch((err) => res.status(502).send({ message: err }));
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.dislikeVideoRéels = async (req, res) => {
  if (!ObjectID.isValid(req.params.id))
    return res.status(400).send("ID unknown : " + req.params.id);

  try {
    let videoRéelsUpdate = await VideoRéelsModel.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likers: req.body.id },
      },
      { new: true }
    );
    if (!videoRéelsUpdate)
      return res.status(404).send({ message: "VideoRéels not found" });

    let userUpdate = await UserModel.findByIdAndUpdate(
      req.body.id,
      {
        $pull: { likes: req.params.id },
      },
      { new: true }
    );
    if (!userUpdate) return res.status(404).send({ message: "User not found" });

    res.send(videoRéelsUpdate);
  } catch (err) {
    return res.status(400).send(err);
  }
};

module.exports.commentVideoRéels = async (req, res) => {
  const { videoRéelsId, commenterId, commenterPseudo, text } = req.body;

  try {
    const videoRéels = await VideoRéelsModel.findById(videoRéelsId);

    if (!videoRéels) {
      return res.status(404).json({ message: "VideoRéels not found" });
    }

    const comment = {
      commenterId,
      commenterPseudo,
      text,
      timestamp: Date.now(),
    };

    videoRéels.comments.push(comment);

    const updatedVideoRéels = await videoRéels.save();

    res.json(updatedVideoRéels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.viewVideoRéels = async (req, res) => {
  const { videoRéelsId, viewerId } = req.body;

  try {
    const videoRéels = await VideoRéelsModel.findById(videoRéelsId);

    if (!videoRéels) {
      return res.status(404).json({ message: "VideoRéels not found" });
    }

    const view = {
      viewerId,
      viewed_at: Date.now(),
    };

    videoRéels.views.push(view);

    const updatedVideoRéels = await videoRéels.save();

    res.json(updatedVideoRéels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports.deleteVideoRéels = async (req, res) => {
  if (!ObjectID.isValid(req.params.videoRéelsId))
    return res.status(400).send("ID unknown : " + req.params.videoRéelsId);

  try {
    const deletedVideoRéels = await VideoRéelsModel.findByIdAndRemove(
      req.params.videoRéelsId
    );
    if (!deletedVideoRéels)
      return res.status(404).send({ message: "VideoRéels not found" });

    await UserModel.updateMany(
      { likes: req.params.videoRéelsId },
      { $pull: { likes: req.params.videoRéelsId } }
    );

    res.send(deletedVideoRéels);
  } catch (err) {
    return res.status(500).send({ message: err });
  }
};
