const router = require("express").Router();
const { deleteCommentCtrl,createCommentCtrl, getAllCommentsCtrl, updateCommentCtrl} = require("../controllers/commentController");
const validateObjectId = require("../middlewares/validateObjectId");
const {verifyToken, verifyTokenAndAdmin, verifyTokenUser, verifyTokenUserAndAdmin } = require("../middlewares/verifyToken");



//api/comments(all comments)
router.route("/")
.post(verifyToken,createCommentCtrl)
.get( verifyTokenAndAdmin, getAllCommentsCtrl)


//api/comments/:id (single comment, delete comment)
router.route("/:id")
.delete(validateObjectId,verifyToken,deleteCommentCtrl)
.put(validateObjectId, verifyToken, updateCommentCtrl)




module.exports = router;