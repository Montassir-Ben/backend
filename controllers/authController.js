const {User,validateRegisterUser,validateLoginUser}=require('../models/User')
const bcrypt=require("bcryptjs")
const asyncHandler=require("express-async-handler")
const VerificationToken = require('../models/VerificationToken')
const crypto=require('crypto')

const sendEmail = require('../utils/sendEmail')


module.exports.registerUser=asyncHandler(async(req,res)=>{

    const {error}=validateRegisterUser(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    let user=await User.findOne({email:req.body.email})
    if(user){
        return res.status(400).json({message:"user already exist"});
    }
    const salt = await bcrypt.genSaltSync(10);
    const  hashedPassword=await bcrypt.hash(req.body.password,salt)
   user=new User({
       username:req.body.username,
       email:req.body.email,
       password:hashedPassword,
   })
   await user.save()
   const verificationToken=new VerificationToken({
    userId: user._id,
    token:crypto.randomBytes(32).toString("hex")
   })
   await verificationToken.save()
   const link=`http://localhost:3000/users/${user._id}/verify/${verificationToken.token}`

   const htmlTemplate=`
   <div>
   <p>Click on the below to verify you email</p>
   <a href="${link}">Verify</a>
   </div>
   `
   await sendEmail(user.email,"Verify Your Email",htmlTemplate)
  
   res.status(201).json({message:"We sent to you an email,please verify your email address"})
    
    

})
module.exports.login=asyncHandler(async(req,res)=>{
    const {error}=validateLoginUser(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    const user=await User.findOne({email:req.body.email});
    if(!user){
        return res.status(400).json({errors:[{message:"invalid email "}]})
    }

    const isPasswordMatch=await bcrypt.compare(req.body.password,user.password)
    
    if(!isPasswordMatch){
        return res.status(400).json({errors:[{message:"invalid  password"}]})
    }
    if(!user.isAccountVerified){
        res.status(400).json({message:"We sent to you an email,please verify your email address"})

    }
    const token=user.generateAuthToken()
    res.status(200).json({
      _id:user._id,
      isAdmin:user.isAdmin,
      profilePhoto:user.profilePhoto,
      token,
      username:user.username,
    })
})

module.exports.verifyUserAccount=asyncHandler( async(req,res)=>{
    const user=await User.findById(req.params.userId)
    if(!user){
        res.status(400).json({message:"invalid link"})
    }
    const verificationToken=await VerificationToken.findOne({
        userId:user._id,
        token:req.params.token
    })
    if(!verificationToken){
        res.status(400).json({message:"invalid link"})
}
    user.isAccountVerified=true
    await user.save()
    await VerificationToken.findByIdAndDelete(verificationToken._id)
    res.status(200).json({message:"Your account verified"})
})