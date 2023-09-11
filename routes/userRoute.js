const router = require("express").Router();
const { getAllUsersCtrl } = require("../controllers/usersController");



//api/users/profile

router.route("/profile").get(getAllUsersCtrl);

module.exports = router;