const asyncHandler = require("express-async-handler");
const {
  User,
  validateUser,
  validateLoginUser,
  validateUpdateUser,
} = require("../models/user");
const bcrypt = require("bcryptjs");

const path = require("path");
const {cloudinaryRemoveManyImages,cloudinaryUploadImage, cloudinaryRemoveImage} = require("../utils/cloudinary")
const fs = require("fs");
const { Post } = require("../models/post");
const {Comment} = require ("../models/comment")

/**
 *@description get all users
 *
 * @router /api/users/profile
 *
 * @method GET
 *
 * @access private (only admin)
 *
 */

module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {

  const users = await User.find()
  .select("-password")
  .populate("posts");
  res.status(200).json(users);
});

/**
 *@description get  user profile / id
 *
 * @router /api/users/profile/:id
 *
 * @method GET
 *
 * @access public
 *
 */

module.exports.getUserCtrl = asyncHandler(async (req, res) => {
  // console.log(req.user)
  // if(!req.user.isAdmin){
  //    return res.status(403).send("not allowed, only admins")
  // }
  const user = await User.findById(req.params.id)
  .select("-password")
  .populate("posts");

  if (!user) {
    return res.status(401).send("no such a user");
  }
  res.status(200).json(user);
});

/**
 *@description get  user profile / id
 *
 * @router /api/users/profile/:id
 *
 * @method UPDATE
 *
 * @access private (only user himself)
 *
 */

module.exports.updateUserCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      bio: req.body.bio,
    },
  }, {new:true }).select("-password").populate("posts");


  if (!updatedUser) {
    return res.status(401).send("user hasn't been updated");
  }
  res.status(200).json(updatedUser);
});



/**
 *@description get users count
 *
 * @router /api/users/count
 *
 * @method GET
 *
 * @access private (only admin)
 *
 */

module.exports.getUsersCountCtrl = asyncHandler( async (req, res) => {
  const userCount = await User.countDocuments();
  if (!userCount) {
    res.status(500).json({ success: false });
  } else {
    res.send({ userCount: userCount });
  }
});

/**
 *@description profile photo upload
 *
 * @router /api/users/profile/profile-photo
 *
 * @method POST
 *
 * @access private (only logged user)
 *
 */

 module.exports.profilePhotoCtrl = asyncHandler( async (req, res) => {
  //1.validation
  if(!req.file){
    res.status(400).json({message: "no file provided"})

  }
  //2.get the path to the image
  const imagePath= path.join(__dirname,`../images/${req.file.filename}`);

  //3.upload to cloudinary
const result = await cloudinaryUploadImage(imagePath);

  //4.get the user from DB
  const user = await User.findById(req.user.id);

  //5.delete old profile photo if exists
  if(user.profilePhoto.publicId !== null ){
  await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  //6.change the profile photo in DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId:result.public_id
  }
  await user.save();

  //7.send res to the client
  res.status(200).send({message:"your profile photo uploaded successfully",
profilePhoto: {url: result.secure_url, publicId: result.public_id}});

  //8.delete image from server
fs.unlinkSync(imagePath);
});


/**
 *@description  delete user profile
 *
 * @router /api/users/profile/:id
 *
 * @method DELETE
 *
 * @access private (only admin or user himself)
 *
 */

 module.exports.deleteUserCtrl = asyncHandler(async (req, res) => {

  //1.get user from DB
  const user = await User.findById(req.params.id);
  if(!user){
    return res.status(404).send({message: 'user not found'})
  }
  //2.get all posts from DB
  const posts = await Post.find({user: user._id})
  //3.get the public ids from DB
  const publicIds = posts?.map(post=>post.image.publicId)
  //4.delete all posts image from cloudinary of the user
if(publicIds?.length > 0){
  await cloudinaryRemoveManyImages(publicIds);
}
  //5.delete the profile picture from cloudinary
  if(user?.profilePhoto?.publicId !== null)
{  await cloudinaryRemoveImage(user?.profilePhoto?.publicId);
}  //6.delete user posts and comments
  await Post.deleteMany({user: user._id});
  await Comment.deleteMany({user : user._id})
  //7.delete the user himself
  await User.findByIdAndDelete(req.params.id)

  //8.send res to the client
  res.status(200).send({message: 'your profile has been deleted'});

});