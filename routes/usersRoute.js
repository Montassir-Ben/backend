const express=require("express");
const { getAllUsers,getUserProfile,updateUserProfile,getUserCount,profilePhotoUpload,deleteUserProfile} = require("../controllers/usersController");
const {verifyTokenAndAdmin,verifyTokenAndOnlyUser,verifyToken,verifyTokenAndAuthorization} = require("../middlewares/verifyToken");
const validateObjectId=require('../middlewares/validateObjectId');
const photoUpload = require("../middlewares/photoUpload");
const router= new express.Router()

router.route("/api/users/profile").get(verifyTokenAndAdmin,getAllUsers)
router.route('/api/users/profile/:id')
      .get(validateObjectId,getUserProfile)
      .put(validateObjectId,verifyTokenAndOnlyUser,updateUserProfile)
      .delete(validateObjectId,verifyTokenAndAuthorization,deleteUserProfile)
router.route("/api/users/count").get(verifyTokenAndAdmin,getUserCount)    
router.route("/api/users/profile/profile-photo-upload").post(verifyToken,photoUpload.single("image"),profilePhotoUpload)
module.exports=router;