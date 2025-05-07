const express = require("express");
const router = express.Router();
const { registerUser, verifyOtp, resendOtp,loginUser ,forgotPassword,resetPassword} = require("../controllers/authController");
const{ getUsers,getUser,addUser,updateUser,deleteUser} = require("../controllers/userController");
const{ protect , adminOnly } = require("../middlewares/authMiddleware");


//public routes
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp',resendOtp);
router.post('/login',loginUser);
router.post('/forgot-password',forgotPassword);
router.post('/reset-password',resetPassword);

//protected routes

router.get('/users',protect,getUsers);
router.get('/users/:id',protect,getUser);
router.post('/users',protect,adminOnly,addUser);
router.put('/users/:id',protect,adminOnly,updateUser);
router.delete('/users/:id',protect,adminOnly,deleteUser);


module.exports = router;
