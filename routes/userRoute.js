const router = require("express").Router();
const { getAllUsersCtrl, getUserCtrl, updateUserCtrl, getUsersCountCtrl } = require("../controllers/usersController");
const { verifyTokenAndAdmin, verifyTokenUser } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");


//api/users/profile

router.route("/profile").get(verifyTokenAndAdmin, getAllUsersCtrl);

//api/users/profile/:id

router.route("/profile/:id")
.get( validateObjectId,getUserCtrl)
.put(validateObjectId,verifyTokenUser,updateUserCtrl )

//api/users/count

router.route("/count").get(verifyTokenAndAdmin, getUsersCountCtrl);


module.exports = router;