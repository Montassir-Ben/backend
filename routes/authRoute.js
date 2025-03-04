const express=require('express')
const {registerUser,login, verifyUserAccount}=require('../controllers/authController')
const router=new express.Router()

router.post('/api/auth/register',registerUser)
router.post('/api/auth/login',login)
router.get('/api/auth/:userId/verify/:token',verifyUserAccount)

module.exports=router
