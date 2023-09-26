const mongoose = require ("mongoose") , timestamps = require('mongoose-timestamp');
const Joi = require("joi");

//post schema

const PostSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200
    },

    description: {
        type: String,
        required: true,
        trim: true,
        minlength: 10,
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    image:{
        type: Object,
        default:{
            url: "",
            publicId: null
        }
    },

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]



},
{
    timestamps: true,
    toJSON:{virtuals: true},
    toObject: {virtuals: true}
}
);

PostSchema.virtual("comments",{
    ref: "Comment",
    foreignField: "postId",
    localField: "_id"
})

const Post = mongoose.model("Post", PostSchema);

//validate create post
function validateCreatePost(obj){
    const schema = Joi.object({
        title :Joi.string().trim().min(2).max(200).required(),
        description :Joi.string().trim().min(10).required(),
        user: Joi.required(),
        category :Joi.string().trim().required(),
        image:Joi.object()

    })

    return schema.validate(obj);
}

//validate update post
function validateUpdatePost(obj){
    const schema = Joi.object({
        title :Joi.string().trim().min(2).max(200),
        description :Joi.string().trim().min(10),
        category :Joi.string().trim(),
        image:Joi.object()

    })

    return schema.validate(obj);
}

module.exports ={
    Post,
    validateCreatePost,
    validateUpdatePost
}