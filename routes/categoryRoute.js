const express=require("express")
const {  verifyTokenAndAdmin } = require("../middlewares/verifyToken")
const { createCategory, getAllCategory, deleteCategory } = require("../controllers/categoryController");
const validateObjectId = require("../middlewares/validateObjectId");
const router=new express.Router()
router.route("/api/categories/:id").delete(validateObjectId,verifyTokenAndAdmin,deleteCategory);
router.route("/api/categories").post(verifyTokenAndAdmin,createCategory)
                              .get(getAllCategory);

module.exports=router