const asyncHandler=require("express-async-handler")
const { validateEmail, User, validateNewPassword } = require("../models/User")
const VerificationToken = require("../models/VerificationToken")
const  crypto=require('crypto')
const sendEmail =require("../utils/sendEmail")
const bcrypt=require("bcryptjs")

module.exports.SendResetPasswordLink=asyncHandler(async(req,res)=>{
    const {error}=validateEmail(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    const user= await  User.findOne({email:req.body.email})
    if(!user){
        return res.status(404).json({message:"User with given email does not exist!"})
    }
 
    let verificationToken= await VerificationToken.findOne({userId:user._id})
    if(!verificationToken){
        verificationToken=await new VerificationToken({
            userId:user._id,
            token:crypto.randomBytes(32).toString("hex")
        })
        await verificationToken.save()
    }
    const link=`http://localhost:3000/reset-password/${user._id}/${verificationToken.token}`
    const htmlTemplate=`
    <a href="${link}">Click here to rest your password</a>
    `
    await sendEmail(user.email,"Reset Password",htmlTemplate)
  
    res.status(200).json({message:"Password reset link sent to your email, Please check your inbox"})
})

module.exports.getResetPasswordLink=asyncHandler(async(req,res)=>{
    const user=await User.findById(req.params.userId)
    if(!user){
        return res.status(404).json({message:"invalid link"})
    }
    const verificationToken=await VerificationToken.findOne({
        userId:req.params.userId,
        token:req.params.token
    })
    if(!verificationToken){
        return res.status(404).json({message:"invalid link"})
    }
    res.status(200).json({message:"valid url"})
})

module.exports.resetPassword=asyncHandler(async(req,res)=>{
    const {error}=validateNewPassword(req.body)
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }
    const user=await User.findById(req.params.userId)
    if(!user){
        return res.status(404).json({message:"invalid link"})
    }
    const verificationToken=await VerificationToken.findOne({
        userId:req.params.userId,
        token:req.params.token
    })
    if(!verificationToken){
        return res.status(404).json({message:"invalid link"})
    }
    if(!user.isAccountVerified){
       user.isAccountVerified=true
    }
    const salt = await bcrypt.genSaltSync(10);
    const  hashedPassword=await bcrypt.hash(req.body.password,salt)
    user.password=hashedPassword
    await user.save()
    await VerificationToken.findByIdAndDelete(verificationToken._id)
    res.status(200).json({message:"Password reset successfully,please login"})
})