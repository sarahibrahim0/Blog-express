const router = require("express").Router();
const {updatePostImageCtrl,deleteSinglePostCtrl, getPostsCountCtrl,createPostCtrl , getAllPostsCtrl, getSinglePostCtrl, updateSinglePostCtrl, togglePostLikeCtrl } = require("../controllers/postsController");
const {verifyToken, verifyTokenAndAdmin, verifyTokenUser, verifyTokenUserAndAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");


//api/posts (all posts)
router.route("/")
.post(verifyToken, photoUpload.single("image"), createPostCtrl)
.get(getAllPostsCtrl);

//api/posts/count
router.route("/count").get(getPostsCountCtrl);

//api/posts/:id (single post, delete single post)
router.route("/:id")
.get(validateObjectId,getSinglePostCtrl)
.delete(validateObjectId, verifyToken, deleteSinglePostCtrl)
.put(validateObjectId, verifyToken, updateSinglePostCtrl)

//api/posts/:id (single post, delete single post)
router.route("/post-image/:id")
.put(validateObjectId, verifyToken,photoUpload.single("image"), updatePostImageCtrl)

//api/posts/:id (single post, delete single post)
router.route("/like/:id")
.put(validateObjectId, verifyToken, togglePostLikeCtrl)





module.exports = router;