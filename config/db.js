const mongoose = require('mongoose');
 require('dotenv').config();

const MONGO_URL = process.env.MONGO_URL;


const connectDb = async()=>{
  try{
    console.log(MONGO_URL);
    await mongoose.connect(MONGO_URL)
    console.log("MongoDb connected successfully")
  }catch(err){
    console.log("MongoDb connection failed:",err.message);
    process.exit(1);
  }
};

 module.exports = connectDb;
