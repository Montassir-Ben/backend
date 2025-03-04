const express=require("express")
const { SendResetPasswordLink, getResetPasswordLink, resetPassword } = require("../controllers/passwordController")



const  router= new express.Router()

router.route("/api/password/reset-password-link").post(SendResetPasswordLink)
router.route("/api/password/reset-password/:userId/:token")
      .get(getResetPasswordLink)
      .post(resetPassword)
module.exports=router