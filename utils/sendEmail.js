const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service : 'gmail',
  auth : {
    user : process.env.EMAIL_USER,
    pass : process.env.EMAIL_PASS,
  },
});

exports.sendOtp = async(to,otp)=>{
  await transporter.sendMail({
    from  : `"Admin Panel" <${process.env.EMAIL_USER}>`,
    to,
    subject : "OTP for Email verification",
    text: ` Your OTP is : ${otp}. It will expires in 5 minutes.`,
  });
};