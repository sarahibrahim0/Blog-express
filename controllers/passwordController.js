const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateNewPassword, validateEmail } = require("../models/user");
const { use } = require("../routes/authRoute");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const VerificationToken = require("../models/VerificationToken");

/**
 *@description reset password link
 *
 * @router /api/password/reset-password-link
 *
 * @method POST
 *
 * @access public
 *
 */

module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validateEmail(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  }

  //get user from db
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    res.status(404).json({ message: "user not found" });
  }

  //creating verification token
  let verificationToken = await VerificationToken.findOne({ userId: user._id });
  if (!verificationToken) {
    verificationToken = new VerificationToken({
      userId: user._id,
      token: crypto.randomBytes(16).toString("hex"),
    });
  }

  await verificationToken.save();

  //creating link
  const link = `https://react-blog-86b6e.web.app/reset-password/${user._id}/${verificationToken.token}`;
  //creating html template
  const htmlTemplate = `
    <a href="${link}">
    click here to reset password
    </a>
    `;
  //sending email
  await sendEmail(user.email, "Reset Password", htmlTemplate);
  //response to the client
  res.status(200).json({ message: "password reset link sent to your email" });
});

// /**
//  *@description reset password link
//  *
//  * @router /api/password/reset-password-link
//  *
//  * @method POST
//  *
//  * @access public
//  *
//  */

// module.exports.sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
//   //validation
//   const { error } = validateEmail(req.body);
//   if (error) {
//     res.status(400).json({ message: error.details[0].message });
//   }

//   //get user from db
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) {
//     res.status(404).json({ message: "user not found" });
//   }

//   //creating verification token
//   let verificationToken = await VerificationToken.findOne({ userId: user._id });
//   if (!verificationToken) {
//     verificationToken = new VerificationToken({
//       userId: user._id,
//       token: crypto.randomBytes(16).toString("hex"),
//     });
//   }
//   //creating link
//   const link = `http:localhost:3000/reset-password/${user._id}/${verificationToken.token}`;
//   //creating html template
//   const htmlTemplate = `
//     <a href="${link}">
//     click here to reset password
//     </a>
//     `;
//   //sending email
//   await sendEmail(user.email, "Reset Password", htmlTemplate);
//   //response to the client
//   res.status(200).json({ message: "password reset link sent to your email" });
// });

/**
 *@description get reset password link
 *
 * @router /api/password/reset-password/:userId/:token
 *
 * @method GET
 *
 * @access public
 *
 */

module.exports.getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  //get user from db
  const user = await User.findById(req.params.userId);
  if (!user) {
    res.status(404).json({ message: "user not found" });
  }

  //creating verification token
  let verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });
  if (!verificationToken) {
    res.status(400).json({ message: "invalid link" });
  }

  //response to the client
  res.status(200).json({ message: "valid url" });
});



/**
 *@description  reset password
 *
 * @router /api/password/reset-password/:userId/:token
 *
 * @method POST
 *
 * @access public
 *
 */

 module.exports.resetPasswordCtrl = asyncHandler(async (req, res) => {

      //validation
  const { error } = validateNewPassword(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  }
    //get user from db
    const user = await User.findById(req.params.userId);
    if (!user) {
      res.status(404).json({ message: "user not found" });
    }

    //creating verification token
    let verificationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!verificationToken) {
      res.status(400).json({ message: "invalid link" });
    }

    if(!user.isVerified){
        user.isVerified = true;
    };

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    user.password = hashedPassword;
    await user.save();
    await verificationToken.deleteOne({
        userId: user._id,
        token: verificationToken.token,
      });


    //response to the client
    res.status(200).json({ message: "password reset successfully" });
  });
