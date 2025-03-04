const express=require("express")
const {createPost, getAllPosts, getSinglePost, getPostCount, deletePost, updatePost, toggleLike, updatePostImage}=require("../controllers/postController")
const{verifyToken}=require("../middlewares/verifyToken")
const validateObjectId=require("../middlewares/validateObjectId");
const photoUpload=require("../middlewares/photoUpload")


const router= new express.Router();
router.route("/api/posts/count").get(getPostCount) 
router.route("/api/posts")
.post(verifyToken,photoUpload.single("image"),createPost)
.get(getAllPosts);

router.route("/api/posts/:id").get(validateObjectId,getSinglePost)
                              .delete(validateObjectId,verifyToken,deletePost)
                              .put(validateObjectId,verifyToken,updatePost);

router.route("/api/posts/like/:id").put(validateObjectId,verifyToken,toggleLike);
router.route("/api/posts/update-image/:id").put(validateObjectId,verifyToken,photoUpload.single("image"),updatePostImage)                    

   

module.exports=router
