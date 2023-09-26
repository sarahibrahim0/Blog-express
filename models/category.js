const mongoose = require("mongoose"),timestamps = require("mongoose-timestamp");
const Joi = require("joi");

//comment schema
const CategorySchema = mongoose.Schema(
  {

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

const Category = mongoose.model("Category", CategorySchema);

//validate create category
function validateCreateCategory(obj) {
  const schema = Joi.object({
    title: Joi.string().trim().required().label("Title"),
    user:Joi.required(),

  });

  return schema.validate(obj);
}

function validateUpdateCategory(obj) {
//validate update category
  const schema = Joi.object({
    title: Joi.string().trim()

  });

  return schema.validate(obj);
}

module.exports = {
  Category,
  validateCreateCategory,
  validateUpdateCategory,
};
