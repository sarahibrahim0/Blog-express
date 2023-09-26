const jwt = require("jsonwebtoken");


function verifyToken(req,res,next){
const authToken = req.headers.authorization;

if(authToken){

const token= authToken.split(" ")[1];

try{

    const decodedPayload = jwt.verify(token,process.env.JWT_SECRET);
    // console.log(decodedPayload)
    req.user = decodedPayload;
    next();
}
catch(error){
return res.status(401).send("invalid token")
}

}else{

    return res.status(401).send("token doesn't exist")
}


}

//verify token and admin
function verifyTokenAndAdmin(req,res,next){

    verifyToken(req, res, ()=>{
        if(req.user.isAdmin){
            next()
        }else{
            return res.status(403).send("not allowed, only admins")
        }
    });

    }

    //verify token of user
function verifyTokenUser(req,res,next){

    verifyToken(req, res, ()=>{
        if(req.user.id === req.params.id){
            next()
        }else{
            return res.status(403).send("not allowed, only user himself")
        }
    });

    }

        //verify token & Authorization
function verifyTokenUserAndAdmin(req,res,next){

    verifyToken(req, res, ()=>{
        if(req.user.id === req.params.id || req.user.isAdmin){
            next()
        }else{
            return res.status(403).send("not allowed, only user himself or admin")
        }
    });

    }

module.exports = {verifyToken, verifyTokenAndAdmin, verifyTokenUser , verifyTokenUserAndAdmin}