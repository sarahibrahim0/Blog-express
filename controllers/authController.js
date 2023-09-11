const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {User, validateUser, validateLoginUser} = require("../models/user");
const { use } = require("../routes/authRoute");


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

 module.exports.registerUserCtrl = asyncHandler(async(req, res)=>{
    //validation
    const {error} = validateUser(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    //does user exist already?
    let user = await User.findOne({email: req.body.email});
    if(user){
        return  res.status(400).send('Email is taken')
    }
    //hash password
    let saltRounds= await bcrypt.genSalt(10);
    let hashedPassword =await bcrypt.hashSync(req.body.password ,saltRounds);

    //new user and save it to db
    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: hashedPassword,

    })

    await user.save();
    //send response to client
    res.status(201).send('you registered successfully , log in')


 })


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

 module.exports.loginUserCtrl = asyncHandler(async(req, res)=>{
    //validation
    const {error} = validateLoginUser(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    //does user exist already in db?
    let user = await User.findOne({email: req.body.email});
    if(!user){
        return  res.status(400).send('invalid email or password')
    }
    //decrypt password and compare

    const isPasswordMAtched = await bcrypt.compare(req.body.password, user.password)
    if(!isPasswordMAtched){
        return  res.status(400).send('invalid email or password')
    }
    //generate token(jwt)
    const token = user.generateAuthToken();

    //send response to client
    res.status(200).send({_id : user._id, isAdmin: user.isAdmin, profilePhoto: user.profilePhoto, token})


 })