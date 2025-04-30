const express = require('express');
const connectDb = require('./config/db');
const authRoutes = require('./routes/authRoutes')
require('dotenv').config();

connectDb();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;


app.use('/api/auth', authRoutes);

app.listen(PORT,(err,result)=>{
    if(err){
        console.log("Something went wrong in connecting server:",err.message);
    }else{
    console.log(`Server running on port ${PORT}`);
    }
})