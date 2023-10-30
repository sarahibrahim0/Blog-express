
const asyncHandler = require("express-async-handler");
const {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} = require("../models/comment");

const { User } = require("../models/user");

/**
 *@description get all comments
 *
 * @router /api/comments
 *
 * @method GET
 *
 * @access private(only admin)
 *
 */
 module.exports.getAllCommentsCtrl = asyncHandler(async (req, res) => {

  const comments = await Comment.find().populate("user",["-password"]);
  res.status(200).json(comments)

});


/**
 *@description create new comment
 *
 * @router /api/comments
 *
 * @method POST
 *
 * @access private(only logged user)
 *
 */

module.exports.createCommentCtrl = asyncHandler(async (req, res) => {
const {error} = validateCreateComment(req.body);
if(error){
    res.status(400).json({message: error.details[0].message});
}
const profile = await User.findById(req.user.id);
const comment = await Comment.create({
    postId: req.body.postId,
    text:req.body.text,
    user : req.user.id,
    userName: profile.username
});

res.status(201).json(comment);
});



/**
 *@description delete comment
 *
 * @router /api/comments/:id
 *
 * @method DELETE
 *
 * @access private(only admin and owner of the comment)
 *
 */
 module.exports.deleteCommentCtrl = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate("user",["-password"]);
  if(!comment){
    res.status(404).json({message:"no comment found"})
  }
  if(req.user.isAdmin || req.user.id === comment.user.toString() ){
    await Comment.findByIdAndDelete(req.params.id)
    res.status(200).json({message: "comment has been deleted", commentId : comment._id})
  }else{
    res.status(403).json({message: "access denied, not allowed"})

  }


})

/**
 *@description update comment
 *
 * @router /api/comments/:id
 *
 * @method PUT
 *
 * @access private(only owner of the comment)
 *
 */

module.exports.updateCommentCtrl = asyncHandler(async (req, res) => {
const {error} = validateUpdateComment(req.body);
if(error){
    res.status(400).json({message: error.details[0].message});
}
const comment = await Comment.findById(req.params.id).populate("user",["-password"])
if(!comment){
  return res.status(404).json({message: "no comment found"})
}
//check user is authorized to edit this comment
if(!req.user.id === comment.user.toString()){
  res.status(403).json({message:"access denied, user not allowed"})

}
  const updatedComment = await Comment.findByIdAndUpdate(req.params.id,{
    $set:{
  text:req.body.text,
    }
  },{new: true});

  res.status(200).json(updatedComment)

});

