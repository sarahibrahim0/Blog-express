const mongoose = require("mongoose"),timestamps = require("mongoose-timestamp");
const Joi = require("joi");

//comment schema
const CommentSchema = mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    text: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Comment = mongoose.model("Comment", CommentSchema);

//validate create comment
function validateCreateComment(obj) {
  const schema = Joi.object({
    postId: Joi.string().required().label("Post Id"),
    text: Joi.string().trim().min(1).required(),
  });

  return schema.validate(obj);
}

//validate update comment
function validateUpdateComment(obj) {
  const schema = Joi.object({
    postId: Joi.string().label("Post Id"),
    text: Joi.string().trim().min(1),
  });

  return schema.validate(obj);
}

module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment,
};
