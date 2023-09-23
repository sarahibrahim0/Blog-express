const asyncHandler = require("express-async-handler");
const {
  User,
  validateUser,
  validateLoginUser,
  validateUpdateUser,
} = require("../models/user");
const bcrypt = require("bcryptjs");

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
  // console.log(req.user)
  // if(!req.user.isAdmin){
  //    return res.status(403).send("not allowed, only admins")
  // }
  const users = await User.find().select("-password");
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
  const user = await User.findById(req.params.id).select("-password");
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
  }, {new:true }).select("-password");


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

 module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {

  const users = await User.countDocuments();
  if (!users) {
    return res.status(401).send("no users exist");
  }
  res.status(200).json(count);
});
