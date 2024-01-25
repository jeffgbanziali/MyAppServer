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
      description: req.body.description,
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

/*module.exports.commentVideoRéels = async (req, res) => {
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
};*/

//write comment the post
module.exports.commentVideoRéels = async (req, res) => {
  try {
      // Validate post ID
      if (!ObjectID.isValid(req.params.id))
          return res.status(400).send("ID unknown : " + req.params.id);

      // Initialize media variables
      let mediaUrl = null;
      let mediaType = null;

      // Check if media exists in the request
      if (req.body.media) {
          mediaUrl = req.body.media.url;
          mediaType = req.body.media.type;
      }

      // Update the post with a new comment
      const updatedPost = await VideoRéelsModel.findByIdAndUpdate(
          req.params.id,
          {
              $push: {
                  comments: {
                      commenterId: req.body.commenterId,
                      commenterPseudo: req.body.commenterPseudo,
                      text: req.body.text,
                      timestamp: new Date().getTime(),
                      commentMedia: req.body.commentMedia,
                      commentType: req.body.commentType,
                  },
              },
          },
          { new: true }
      );

      // Add media properties to the post if they exist
      if (mediaUrl) {
          updatedPost.commentMedia = mediaUrl;
      }

      if (mediaType) {
          updatedPost.commentType = mediaType;
      }

      // Get the ID of the last added comment
      const lastComment = updatedPost.comments[updatedPost.comments.length - 1];
      const commentId = lastComment._id;

      // Send the response with the comment ID
      res.send({ commentId });
  } catch (err) {
      // Log and handle errors
      console.error('Error during comment operation:', err);
      return res.status(500).send({ message: 'An error occurred during comment operation.' });
  }
};

// Reply to a comment on a réels
module.exports.replyCommentVideoRéels = async (req, res) => {
  try {
      // Validate post ID
      if (!ObjectID.isValid(req.params.id))
          return res.status(400).send("ID unknown : " + req.params.id);

      // Extract necessary information
      const postId = req.params.id;
      const commentId = req.body.commentId;
      const repliedTo = req.body.repliedTo;

      // Initialize media variables
      let mediaUrl = null;
      let mediaType = null;

      // Check if media exists in the request
      if (req.body.media) {
          mediaUrl = req.body.media.url;
          mediaType = req.body.media.type;
      }

      // Construct the update object for adding a reply
      const update = {
          $push: {
              "comments.$[outerComment].replies": {
                  replierId: req.body.replierId,
                  replierPseudo: req.body.replierPseudo,
                  text: req.body.text,
                  timestamp: new Date().getTime(),
                  replyMedia: req.body.replyMedia,
                  replyType: req.body.replyType,
                  repliedTo: req.body.repliedTo,
              },
          },
      };

      // Add media properties to the update object if they exist
      if (mediaUrl) {
          update.replyMedia = mediaUrl;
      }

      if (mediaType) {
          update.replyType = mediaType;
      }

      // Add repliedTo information to the update object if provided
      if (repliedTo) {
          update.$push["comments.$[outerComment].replies"].repliedTo = {
              replierToId: repliedTo.replierToId || null,
              replierToPseudo: repliedTo.replierToPseudo || null,
          };
      }

      // Update the post with the new reply
      const updatedPost = await VideoRéelsModel.findByIdAndUpdate(
          postId,
          update,
          {
              new: true,
              arrayFilters: [{ "outerComment._id": commentId }],
          }
      );

      // Send the updated post in the response
      res.send(updatedPost);
  } catch (err) {
      // Log and handle errors
      console.error('Error during reply operation:', err);
      return res.status(500).send({ message: 'An error occurred during reply operation.' });
  }
};


// edit a comment réels
module.exports.editCommentVideoRéels = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

  try {
      return VideoRéelsModel.findById(req.params.id, (err, docs) => {
          const theComment = docs.comments.find((comment) =>
              comment._id.equals(req.body.commentId)
          );

          if (!theComment) return res.status(404).send("Comment not found");
          theComment.text = req.body.text;

          return docs.save((err) => {
              if (!err) return res.status(200).send(docs);
              return res.status(500).send(err);
          });
      });
  } catch (err) {
      return res.status(400).send(err);
  }
};

// delete a comment réels
module.exports.deleteCommentVideoRéels = (req, res) => {
  if (!ObjectID.isValid(req.params.id))
      return res.status(400).send("ID unknown : " + req.params.id);

  try {
      return VideoRéelsModel.findByIdAndUpdate(
          req.params.id,
          {
              $pull: {
                  comments: {
                      _id: req.body.commentId,
                  },
              },
          },
          { new: true })
          .then((data) => res.send(data))
          .catch((err) => res.status(500).send({ message: err }));
  } catch (err) {
      return res.status(400).send(err);
  }
};

// like a comment réels

module.exports.likeCommentVideoRéels = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const userId = req.body.id;

  if (!ObjectID.isValid(postId) || !ObjectID.isValid(commentId))
      return res.status(400).send("Invalid post or comment ID");

  try {
      const updatedPost = await VideoRéelsModel.findOneAndUpdate(
          { _id: postId, "comments._id": commentId },
          {
              $addToSet: { "comments.$.commentLikers": userId },
          },
          { new: true }
      );

      if (!updatedPost) {
          return res.status(404).send("Post or comment not found");
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          {
              $addToSet: { likedComments: commentId },
          },
          { new: true }
      );

      res.send({ updatedPost, updatedUser });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
};

// unlike a comment réels
module.exports.unlikecommentVideoRéels = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const userId = req.body.id;
  ;

  if (!ObjectID.isValid(postId) || !ObjectID.isValid(commentId))
      return res.status(400).send("Invalid post or comment ID");

  try {
      const updatedPost = await VideoRéelsModel.findOneAndUpdate(
          { _id: postId, "comments._id": commentId },
          {
              $pull: { "comments.$.commentLikers": userId },
          },
          { new: true }
      );

      if (!updatedPost) {
          return res.status(404).send("Post or comment not found");
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          {
              $pull: { likedComments: commentId },
          },
          { new: true }
      );

      res.send({ updatedPost, updatedUser });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
};


// like a reply to a comment
module.exports.likeReplyCommentVideoRéels = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const userId = req.body.id;

  if (!ObjectID.isValid(postId) || !ObjectID.isValid(commentId) || !ObjectID.isValid(replyId))
      return res.status(400).send("Invalid post, comment, or reply ID");

  try {
      const updatedPost = await VideoRéelsModel.findOneAndUpdate(
          { _id: postId, "comments._id": commentId, "comments.replies._id": replyId },
          {
              $addToSet: { "comments.$[outerComment].replies.$[innerReply].replierLikers": userId },
          },
          { new: true, arrayFilters: [{ "outerComment._id": commentId }, { "innerReply._id": replyId }] }
      );

      if (!updatedPost) {
          return res.status(404).send("Post, comment, or reply not found");
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          {
              $addToSet: { likedReplies: replyId },
          },
          { new: true }
      );

      res.send({ updatedPost, updatedUser });
  } catch (err) {
      res.status(500).send({ message: err.message });
  }
};


module.exports.unlikeReplyCommentVideoRéels = async (req, res) => {
  const postId = req.params.postId;
  const commentId = req.params.commentId;
  const replyId = req.params.replyId;
  const userId = req.body.id;

  if (!ObjectID.isValid(postId) || !ObjectID.isValid(commentId) || !ObjectID.isValid(replyId))
      return res.status(400).send("Invalid post, comment, or reply ID");

  try {
      const updatedPost = await VideoRéelsModel.findOneAndUpdate(
          { _id: postId, "comments._id": commentId, "comments.replies._id": replyId },
          {
              $pull: { "comments.$[outerComment].replies.$[innerReply].replierLikers": userId },
          },
          { new: true, arrayFilters: [{ "outerComment._id": commentId }, { "innerReply._id": replyId }] }
      );

      if (!updatedPost) {
          return res.status(404).send("Post, comment, or reply not found");
      }

      const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          {
              $pull: { likedReplies: replyId },
          },
          { new: true }
      );

      res.send({ updatedPost, updatedUser });
  } catch (err) {
      res.status(500).send({ message: err.message });
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
