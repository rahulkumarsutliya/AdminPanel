const bcrypt = require("bcryptjs");
const User = require('../models/Users');
const {sendOtp} = require('../utils/sendEmail');
const jwt = require('jsonwebtoken');


//User Registration
exports.registerUser = async(req,resp)=>{

  const { name,email,password} = req.body;
  try{

    if(!name || !email || !password){
      return resp.status(400).send({message: "Fields cannot be empty"});
    }

    let user = await User.findOne({ email});
    if(user) return resp.status(400).send({message:"Email already exists"});

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random()*900000).toString();
    const otpExpires = new Date(Date.now() + 5 *60 *1000);  //5 mint

    user = new User({
      name,
      email,
      password: hashedPassword,
      otp,
      otpExpires,
    });

    await user.save();
    await sendOtp(email,otp)
    
    resp.status(201).send({message:"User Registered . OTP sent to email."});
  }catch(err){
    resp.status(500).send({message:"Error registering User",error:err.message});
  }
};



//Verify Otp

exports.verifyOtp = async(req,resp)=>{
  const { email,otp} = req.body;

  if(!email || !otp){
    return resp.status(400).send({message: "Fiels cannot be empty"});
  }

  const user = await User.findOne({ email });

  if(!user){
    return resp.status(400).send({message:" User Not Found "});
  }

  if(user.otp !== otp || Date.now()> user.otpExpires){
    return resp.status(400).send({message:"Invalid OTP or Expired OTP"});
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save();

  return resp.status(200).send({message:"OTP Verified Successfully"});
};


//Resend Otp 

exports.resendOtp = async(req,resp)=>{
  const { email } = req.body;
  
  try{

    if(!email){
      return resp.status(400).send({message: "Field cannot be empty"});
    }

    const user = await User.findOne({email});

    if(!user){
      return resp.status(404).send({message: "User Not Found"});
    
    }

    if(user.isVerified){
      return resp.status(400).send({message: "User already verified"});
    }

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiration = Date.now() + 5 *60 *1000; //5 mint

    user.otp = newOtp; 
    user.otpExpires = otpExpiration;
    await user.save();

    await sendOtp(user.email, newOtp);

    return resp.status(200).send({message: "OTP resend successfully"});
  }catch(error){
    console.error("Error resending OTP:", error)
    return resp.status(500).send({message: "Server error"});
  }
  
};


//login user

exports.loginUser = async(req,resp)=>{
  const {email,password} = req.body;

  try{

    if(!email || !password){
      return resp.status(400).send({message: "Fields cannot be empty"});
    }

    const user = await User.findOne({ email });

    if(!user) {
      return resp.status(400).send({message: "User Not Found"});
    }
    
    if(!user.isVerified){ 
      return resp.status(403).send({message: "Please verify your email first"});
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
      return resp.status(401).send({message: "Invalid Password"});

    }

    const token = jwt.sign(
      {id: user._id,
       role: user.role},
      process.env.JWT_SECRET,
      {expiresIn : process.env.JWT_EXPIRE}
    );

    resp.status(200).send({
      message: "Login Successfully",
      token,
      user :{
        id:user._id,
        role:user.role,
        name: user.name,
        email : user.email,
      },
    });

  }catch(error){
    console.error("Login Error", error);
    resp.status(500).send({message: "Server Error"});
  }
};


//forgot password

exports.forgotPassword = async(req,resp)=>{
  const {email} = req.body;

  try{

    if(!email){
      resp.status(400).send({message: "Field cannot be empty"});
    }

    const user = await User.findOne({email});

    if(!user){
      return resp.status(404).send({message: "User Not Found"});

    }
   
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 5 * 60 * 1000;
  
    user.otp = resetOtp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtp(user.email, resetOtp);

    resp.status(200).send({message: "OTP sent to email"});
    
  }catch(error){
    console.error("Forgot password error", error);
    resp.status(500).send({message: "Server error"});
  }
};


//reset password

exports.resetPassword = async(req,resp)=>{
  const{ email,otp,newPassword } = req.body;

  try{

    if(!email || !otp || !newPassword){
      return resp.status(400).send({message: "Fields cannot be empty"});
    }

    const user = await User.findOne({ email });

    if(!user || user.otp !== otp || Date.now() > user.otpExpires){
      return resp.status(400).send({message: "Invalid or Expired Otp"});
    }

    user.password = await bcrypt.hash(newPassword,10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    resp.status(200).send({message: "Password reset successfully"});

  }catch(error){
    console.error("Reset password error", error);
    resp.status(500).send({message: "Server error"});
  }
};

