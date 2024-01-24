const router = require("express").Router();
const { getAllUsersCtrl, getUserCtrl, updateUserCtrl, getUsersCountCtrl, profilePhotoCtrl, deleteUserCtrl, getUserPostsCtrl } = require("../controllers/usersController");
const { verifyTokenAndAdmin, verifyTokenUser, verifyTokenUserAndAdmin, verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");


//api/users/profile

router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl );

//api/users/profile/:id
router.route("/profile/:id")
.get( validateObjectId,getUserCtrl)
.put(validateObjectId,verifyTokenUser,updateUserCtrl)
.delete(validateObjectId,verifyTokenUserAndAdmin, deleteUserCtrl)

router.route("/user/:id")
.get(validateObjectId,getUserPostsCtrl)




//api/users/count

router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);

//api/users/profile/profile-photo/:id

router.route("/profile/profile-photo").post(verifyToken, photoUpload.single("image"), profilePhotoCtrl);


module.exports = router;