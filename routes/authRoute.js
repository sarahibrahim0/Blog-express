const router = require("express").Router();
const {registerUserCtrl, loginUserCtrl, verifyUserAccountCtrl } = require("../controllers/authController");


module.exports = router;
///api/auth/register
router.post("/register", registerUserCtrl);


///api/auth/login
router.post("/login", loginUserCtrl);

///api/auth/:userId/verify/:token
router.get("/:userId/verify/:token",verifyUserAccountCtrl);

