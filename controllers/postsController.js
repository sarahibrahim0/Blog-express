const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const {
  Post,
  validateCreatePost,
  validateUpdatePost,
} = require("../models/post");
const {
  cloudinaryRemoveImage,
  cloudinaryUploadImage,
} = require("../utils/cloudinary");

/**
 *@description get all posts
 *
 * @router /api/posts
 *
 * @method GET
 *
 * @access public
 *
 */

module.exports.getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;
  let posts;

  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .populate("user", ["-password"])
      .sort({ createdAt: -1 });
  } else if (category) {
    posts = await Post.find({ category: category })
      .populate("user", ["-password"])
      .sort({ createdAt: -1 });
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }
  res.status(200).json(posts);
});

/**
 *@description get single post
 *
 * @router /api/posts/:id
 *
 * @method GET
 *
 * @access public
 *
 */

module.exports.getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  .populate("user", ["-password",])
  .populate("comments")


  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  res.status(200).json(post);
});

/**
 *@description  get posts count
 *
 * @router /api/count
 *
 * @method GET
 *
 * @access public
 *
 */

module.exports.getPostsCountCtrl = asyncHandler(async (req, res) => {
  const count = await Post.count();
  if (!count) {
    return res.status(404).json({ message: "no posts found" });
  }
  res.status(200).json(count);
});

/**
 *@description create new post
 *
 * @router /api/posts
 *
 * @method POST
 *
 * @access private (only verified logged in users)
 *
 */

module.exports.createPostCtrl = asyncHandler(async (req, res) => {
  //1.validation for image
  if (!req.file) {
    return res.status(400).send({ message: "no image provided" });
  }
  //2.validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).send({ message: error.details[0].message });
  }

  //3.upload photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  const result = await cloudinaryUploadImage(imagePath);

  //4.create new post and save it to DB
  const post = await new Post({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });
  await post.save();

  //5.send res to client
  res.status(200).json(post);

  //6.remove image from the server
  fs.unlinkSync(imagePath);
});

/**
 *@description delete post
 *
 * @router /api/posts/:id
 *
 * @method DELETE
 *
 * @access private (only verified logged in users and admin)
 *
 */

module.exports.deleteSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  console.log(req);
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);

    //delete comments on post
    await Comment.deleteMany({postId: post._id});

    return res.status(200).json({ message: "you post has been deleted successfully" });
  } else {
    return res.send(403).json({ message: "only authorized users allowed" });
  }
});

/**
 *@description update post
 *
 * @router /api/posts/:id
 *
 * @method UPDATE
 *
 * @access private (only verified logged in users and admin)
 *
 */

module.exports.updateSinglePostCtrl = asyncHandler(async (req, res) => {
  //1.validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //2.get the post from db and check if it exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  //3.check user is owner of this post or an admin
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({ message: "access denied" });
  }

  //4.update post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  //send response
  return res.status(200).json(updatedPost);
});

/**
 *@description update post image
 *
 * @router /api/post-image/:id
 *
 * @method UPDATE
 *
 * @access private (only verified logged in users and admin)
 *
 */

module.exports.updatePostImageCtrl = asyncHandler(async (req, res) => {
  //1.validation
  if (!req.file) {
    return res.status(400).json({ message: "no image provided" });
  }
  //2.get the post from db and check if it exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  //3.check user is owner of this post or an admin
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({ message: "access denied" });
  }

  //4.delete old image
  await cloudinaryRemoveImage(post.image.publicId);

  //5.upload new image to cloundinary
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  //6.save public id to database
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: { url: result.secure_url, publicId: result.public_id },
      },
    },
    { new: true }
  );

  //7.send response
  res.status(200).json(updatedPost);

  //8.remove image from server
  fs.unlinkSync(imagePath);
});

/**
 *@description update post
 *
 * @router /api/posts/:id
 *
 * @method UPDATE
 *
 * @access private (only verified logged in users and admin)
 *
 */

module.exports.updateSinglePostCtrl = asyncHandler(async (req, res) => {
  //1.validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //2.get the post from db and check if it exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }
  //3.check user is owner of this post or an admin
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({ message: "access denied" });
  }

  //4.update post
  const updatedPost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  //send response
  return res.status(200).json(updatedPost);
});

/**
 *@description toggle post like
 *
 * @router /api/posts/like/:id
 *
 * @method PUT
 *
 * @access private (only verified logged in users and admin)
 *
 */

module.exports.togglePostLikeCtrl = asyncHandler(async (req, res) => {
  const loggedUser = req.user.id;
  const { id: postId } = req.params;

  //2.get the post from db and check if it exists
  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "post not found" });
  }

  //3.check if user already like the post b4
  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === req.user.id
  );

  if (isPostAlreadyLiked) {
    //remove like from array
    post = await Post.findByIdAndUpdate(postId, {
      $pull: {
        likes: loggedUser,
      },
    },{new: true});
  }else{
        //add like to array
    post = await Post.findByIdAndUpdate(postId, {
      $push: {
        likes: loggedUser,
      },
    },{new: true});
  }

  //7.send response
  res.status(200).json(post);

});
