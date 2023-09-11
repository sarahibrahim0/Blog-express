const asyncHandler = require("express-async-handler");


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

 module.exports.getAllUsersCtrl = asyncHandler(async(req,res)=>{
    const users= await User.find();
    res.status(200).json(users);
 })