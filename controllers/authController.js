const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateUser, validateLoginUser } = require("../models/user");
const { use } = require("../routes/authRoute");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const VerificationToken = require("../models/VerificationToken");

/**
 *@description Register new user - sign up
 *
 * @router /api/auth/register
 *
 * @method POST
 *
 * @access public
 *
 */

module.exports.registerUserCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //does user exist already?
  let user = await User.findOne({ email: req.body.email });
  if (user) {
    return res.status(400).send("Email is taken");
  }
  //hash password
  let saltRounds = await bcrypt.genSalt(10);
  let hashedPassword = await bcrypt.hashSync(req.body.password, saltRounds);

  //new user and save it to db
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
  });

  await user.save();

  //creating new verifiCATION TOKEN AND SAVE IT T DB

  const verificationToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString("hex"),
  });
  await verificationToken.save();

  // make the link
  const link = `https://blog-5g3k.onrender.com/api/auth/${user._id}/verify/${verificationToken.token}`;

  //    putting the link into an html template
  const htmlTemplate = `
    <div>
<p> click on the link below to verify your email</p>
<a href="${link}">Verify</a>
    </div>`;

  //sending email to the user
  await sendEmail(user.email, "verify your email", htmlTemplate);
  //response to the client

  //send response to client
  res.status(201).json({ message: ` ${user.email}` });
});

/**
 *@description log in user - sign in
 *
 * @router /api/auth/login
 *
 * @method POST
 *
 * @access public
 *
 */

module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  //validation
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  //does user exist already in db?
  let user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).send("invalid email or password");
  }
  //decrypt password and compare

  const isPasswordMAtched = await bcrypt.compare(
    req.body.password,
    user.password
  );
  if (!isPasswordMAtched) {
    return res.status(400).send("invalid email or password");
  }

  //verify account

  if (!user.isVerified) {
    let verificationToken = await VerificationToken.findOne({
        userId: user._id
    });
    if(!verificationToken){
        verificationToken = new VerificationToken({
            userId : user._id,
            token: crypto.randomBytes(32).toString()
        })
    }
    await verificationToken.save();

  const link  = `https://blog-5g3k.onrender.com/api/auth/${user._id}/verify/${verificationToken.token}`;

  //    putting the link into an html template
  const htmlTemplate = `
    <div>
<p> click on the link below to verify your email</p>
<a href="${link}">Verify</a>
    </div>`;

  //sending email to the user
  await sendEmail(user.email, "verify your email", htmlTemplate);


    return res
      .status(400)
      .json({ message: "we sent to you an email please verify it" });
  }
  //generate token(jwt)
  const token = user.generateAuthToken();

  //send response to client
  res
    .status(200)
    .send({
      _id: user._id,
      isAdmin: user.isAdmin,
      profilePhoto: user.profilePhoto,
      token,
      username: user.username,
    });
});

/**
 *@description verify user account
 *
 * @router /api/auth/:userId/verify/:token
 *
 * @method GET
 *
 * @access public
 *
 */

module.exports.verifyUserAccountCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({ message: "invalid link" });
  }

  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token,
  });

  if (!verificationToken) {
    return res.status(400).json({ message: "invalid link" });
  }

  user.isVerified = true;
  await user.save();

  await verificationToken.deleteOne({
    userId: user._id,
    token: req.params.token,
  });

  res.status(200).json({ message: "Your account verified" });
});
