const mongoose = require("mongoose"),
  timestamps = require("mongoose-timestamp");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");

const UserSchema = mongoose.Schema(
  {
    username: {
      type: String, //data type of the field;
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 100,
    },

    email: {
      type: String, //data type of the field;
      required: true,
      trim: true,
      maxLength: 100,
      unique: true,
    },

    password: {
      type: String, //data type of the field;
      required: true,
      trim: true,
      minLength: 6,
    },
    profilePhoto: {
      type: Object, //data type of the field;
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
        publicId: null,
      },
    },

    bio: {
      type: String,
    },
    isAdmin: {
      required: true,
      type: Boolean,
      default: false,
    },
    isVerified: {
      required: true,
      type: Boolean,
      default: false,
    },

  socialMedia :[
  {  name: {
      type: String,
    },
    url: {
      type: String,
    }}
  ]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//populate posts that belongs to the user when getting the profile
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

//generate token
const secret = process.env.JWT_SECRET;

UserSchema.methods.generateAuthToken = function () {
  console.log(this._id, this.isAdmin);
  return jwt.sign(
    {
      id: this._id,
      isAdmin: this.isAdmin,
    },
    secret
  );
};

const User = mongoose.model("User", UserSchema);

//Validate user

function validateUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100).required(),
    email: joi.string().trim().max(100).required().email(),
    password: passwordComplexity().required(),
    isAdmin: joi.boolean().required(),
    isVerified: joi.boolean().required(),
  });
  return schema.validate(obj);
}

function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().max(100).required().email(),
    password: joi.string().trim().min(6).required(),
  });
  return schema.validate(obj);
}

//validate email
function validateEmail(obj) {
  const schema = joi.object({
    email: joi.string().trim().max(100).required().email(),
  });
  return schema.validate(obj);
}
//validate update user

function validateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(2),
    email: joi.string().trim().max(100).email(),
    password: passwordComplexity(),
    bio: joi.string(),
    socialMedia: joi.array()
  });
  return schema.validate(obj);
}
function validateNewPassword(obj) {
  const schema = joi.object({
    password: passwordComplexity().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateNewPassword,
  validateUser,
  validateLoginUser,
  validateUpdateUser,
  validateEmail,
};
