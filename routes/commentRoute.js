const express=require("express")
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken")
const { createComment, getAllComment, deleteComment, updateComment } = require("../controllers/commentsController");
const validateObjectId = require("../middlewares/validateObjectId");
const router=new express.Router()
router.route("/api/comments/:id").delete(validateObjectId,verifyToken,deleteComment) 
                                 .put(validateObjectId,verifyToken,updateComment);
router.route("/api/comments").post(verifyToken,createComment)
                            .get(verifyTokenAndAdmin,getAllComment);
                     


module.exports=router