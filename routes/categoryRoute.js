const router = require("express").Router();
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoryCtrl, getCategoryPostsCtrl } = require("../controllers/categoryController");
const validateObjectId = require("../middlewares/validateObjectId");
const {verifyToken, verifyTokenAndAdmin, verifyTokenUser, verifyTokenUserAndAdmin } = require("../middlewares/verifyToken");



//api/comments(all categories)
router.route("/")
.post(verifyTokenAndAdmin,createCategoryCtrl)
.get(getAllCategoriesCtrl)

//api/categories/:id (delete category)
router.route("/:id")
.delete(validateObjectId,verifyTokenAndAdmin, deleteCategoryCtrl)

//api/categories/:id (delete category)
router.route("/category/:category")
.get(getCategoryPostsCtrl)



module.exports = router;