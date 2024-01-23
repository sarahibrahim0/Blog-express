
const asyncHandler = require("express-async-handler");
const {
  validateCreateCategory,
  validateUpdateCategory,
} = require("../models/category");

const { Category } = require("../models/category");
const { Post } = require("../models/post");
const { Comment } = require("../models/comment");

const { cloudinaryRemoveManyImages, cloudinaryRemoveImage } = require("../utils/cloudinary");
const { findByIdAndDelete } = require("../models/VerificationToken");


/**
 *@description get all categories
 *
 * @router /api/categories
 *
 * @method GET
 *
 * @access public
 *
 */

 module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {

    const categories = await Category.find().populate("user",["-password"])

    res.status(200).json(categories);
    });


/**
 *@description create new category
 *
 * @router /api/comments
 *
 * @method POST
 *
 * @access private(only logged user)
 *
 */

module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
const {error} = validateCreateCategory(req.body);
if(error){
    res.status(400).json({message: error.details[0].message});
}
const category = await Category.create({
    title:req.body.title,
    user : req.user.id,
});

res.status(201).json(category);
});




/**
 *@description delete category
 *
 * @router /api/categories/:id
 *
 * @method DELETE
 *
 * @access private(only admin)
 *
 */

 module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) => {

    const category = await Category.findById(req.params.id);
    if(!category){
        res.send(404).json({message: "no category found"});
    }
    if(req.user.isAdmin){

        const posts = await Post.find({category : category.title});
           if(posts.length > 0 ){
            for(let post of posts){
                await cloudinaryRemoveImage(post.image.publicId);
                if(posts.comments?.length !== 0)
                {    await Comment.deleteMany({postId: posts._id});
                }

                await Post.findByIdAndDelete(post._id);

                }
           }
        await Category.findByIdAndDelete(req.params.id);

    }


    res.status(200).json({message:"category deleted", categoryId: category._id});
    });