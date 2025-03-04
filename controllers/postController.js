const asyncHandler=require("express-async-handler")
const {Post,validateCreatePost,validateUpdatePost}=require("../models/Post")
const path=require("path")
const fs=require("fs")
const {Comment}=require("../models/Comment")
const {cloudinaryRemoveImage,cloudinaryUploadImage}=require("../utils/cloudinary")

module.exports.createPost=asyncHandler(async(req,res)=>{

   if(!req.file){
      return res.status(400).json({message:"no image provided"})
   }
  
   const {error}=validateCreatePost(req.body)
   if(error){
    return res.status(400).json({message:error.details[0].message})
   }
  const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
  const result=await cloudinaryUploadImage(imagePath)
   const post = await Post.create({
    title:req.body.title,
    description:req.body.description,
    category:req.body.category,
    user:req.user.id,
    
    image:{
      url:result.secure_url,
      publicId:result.public_id
    }
   })
   fs.unlinkSync(imagePath)
   res.status(201).json(post)
})

module.exports.getAllPosts=asyncHandler(async(req,res)=>{
 const {pageNumber,category}=req.query
 const POST_PER_PAGE=3
 let posts;
 if(pageNumber){
    posts=await Post.find()
        .skip((pageNumber-1)*POST_PER_PAGE)
        .limit(POST_PER_PAGE)
        .sort({createdAt:-1}) 
        .populate("user",["-password"])
        .populate("comments")
        
 }
 else if(category){
    posts=await Post.find({category:category}).sort({createdAt:-1}).populate("user",["-password"])
 }else {
    posts=await Post.find().sort({createdAt:-1})
     .populate("user",["-password"])
 }

 res.status(200).json(posts)
 
})


module.exports.getPostCount=asyncHandler(async(req,res)=>{
    
    const count=await Post.count()
    
  
    res.status(200).json(count)
   })


module.exports.getSinglePost=asyncHandler(async(req,res)=>{
    const post= await Post.findById(req.params.id).populate("user",["-password"]).populate("comments")
    if(!post){
        res.status(404).json({message:"post not found"})
    }
    res.status(200).json(post)
});


module.exports.deletePost=asyncHandler(async(req,res)=>{
    const post=await Post.findById(req.params.id)
    if(!post){
        res.status(404).json({message:"post not found"})
    }
    
    if(req.user.isAdmin || req.user.id ===post.user.toString()){
      await Comment.deleteMany({postId:post._id})
     
      await cloudinaryRemoveImage(post.image.publicId)
     await Post.findByIdAndDelete(req.params.id)
     
     res.status(200).json({message:"post has been deleted successfully",postId:post._id})
    }else{
        res.status(403).json({message:"access denied ,forbidden"})
    }
})


module.exports.updatePost=asyncHandler(async(req,res)=>{
    const {error}=validateUpdatePost(req.body)
    if(error){
       return res.status(400).json({message:error.details[0].message})
    }
    const post=await Post.findById(req.params.id)
    if(!post){
      return   res.status(404).json({message:"post not found"})
    }
    if(req.user.id !==post.user.toString()){
       return res.status(403).json({message:"access denied ,you are not allowed"})
    }
   const updatePost= await Post.findByIdAndUpdate(req.params.id,{
    $set:{
        title:req.body.title,
        description:req.body.description,
        category:req.body.category
    }
   },{new:true}).populate("user","[-password]")
    res.status(200).json(updatePost)

})

module.exports.updatePostImage=asyncHandler(async(req,res)=>{
   if(!req.file){
      return res.status(400).json({message:"no image provided"})
   }
   const post=await Post.findById(req.params.id)
   if(!post){
      return res.status(404).json({message:"post non found"})
   }
 
   if(req.user.id !==post.user.toString()){
      return res.status(403).json({message:"access denied ,you are not allowed"})
   }
   await cloudinaryRemoveImage(post.image.publicId)
   const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
   const result=await cloudinaryUploadImage(imagePath)
 
   const updatepost=await Post.findByIdAndUpdate(req.params.id,{
      $set:{
         image:{
            url:result.secure_url,
            public_id:result.public_id
          }
      }
   },{new:true}).populate("user","[-password]")
   res.status(200).json(updatepost)
   fs.unlinkSync(path.join(__dirname,`../images/${req.file.filename}`))
})


module.exports.toggleLike=asyncHandler(async(req,res)=>{
    const {id:postId}=req.params
    const loggedInUser=req.user.id
    let post=await Post.findById(postId)
    if(!post){
       return res.status(404).json({message:"post not found "})
    }
    const isPostAlreadyLiked=post.likes.find((user)=>user.toString()===loggedInUser)
    if(isPostAlreadyLiked){
       post=await Post.findByIdAndUpdate(postId,{
          $pull:{likes:loggedInUser}
       },{new:true})
    }else{
       post=await Post.findByIdAndUpdate(postId,{
          $push:{likes:loggedInUser}
       },{new:true}) 
    }
    res.status(200).json(post)
 
 })



