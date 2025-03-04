const asyncHandler=require("express-async-handler")
const {User,validateUpdateUser}=require("../models/User")
const bcrypt=require("bcryptjs")
const path=require("path")
const fs=require("fs")
const {cloudinaryRemoveImage,cloudinaryUploadImage}=require("../utils/cloudinary")
const { Post } = require("../models/Post")
const {Comment}=require("../models/Comment")
const {}=require("../models/Comment")


module.exports.getAllUsers=asyncHandler(async(req,res)=>{
   

    const users=await User.find().select("-password").populate("posts")
    res.status(200).json(users)

})

module.exports.getUserProfile=asyncHandler(async(req,res)=>{
   const user=await User.findById(req.params.id).select("-password").populate("posts")
   if(!user){
      return res.status(404).json({message:"user not  found"})
   }
   res.status(200).json(user)
})

module.exports.updateUserProfile=asyncHandler(async(req,res)=>{
   const {error}=validateUpdateUser(req.body)
   if(error){
      res.status(400).json({message:error.details[0].message})
   }
   if(req.body.password){
      const  salt=await bcrypt.genSalt(10)
      req.body.password=await bcrypt.hash(req.body.password,salt)

   }
   const updatedUser=await User.findByIdAndUpdate(req.params.id,{
      $set:{
         username:req.body.username,
       //  password:req.body.password,
         bio:req.body.bio,
      },
   },{new:true})
   res.status(200).json(updatedUser)

})
module.exports.getUserCount=asyncHandler(async(req,res)=>{
 const count=await User.count()
 res.status(200).json(count)
})

module.exports.profilePhotoUpload=asyncHandler(async(req,res)=>{
   if(!req.file){
      return res.status(400).json({message:'no file provided'})
   }
   const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
   const result=await cloudinaryUploadImage(imagePath)
   const user=await User.findById(req.user.id)
   if(user.profilePhoto.publicId!==null){
    await cloudinaryRemoveImage(user.profilePhoto.publicId)
   }
   user.profilePhoto={
      url:result.secure_url,
      publicId:result.public_id,
   }
   await user.save()
 res.status(200).json({message:"your profile photo uploaded successfully",profilePhoto:{url:result.secure_url,publicId:result.public_id}})
  fs.unlinkSync(imagePath)
})


module.exports.deleteUserProfile=asyncHandler(async(req,res)=>{
   const user=await User.findById(req.params.id)
   if(!user){
     return  res.status(404).json({message:"user not found"})
   }
   if(user.profilePhoto.publicId !== null){
      await cloudinaryRemoveImage(user.profilePhoto.publicId)
   }

   await Post.deleteMany({user:user._id})
   await Comment.deleteMany({user:user._id})
  await User.findByIdAndDelete(req.params.id)
  res.status(200).json({message:"your profile has been deleted"})
})
