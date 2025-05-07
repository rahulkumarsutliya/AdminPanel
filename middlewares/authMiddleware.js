const jwt = require('jsonwebtoken');
const User = require('../models/Users');

exports.protect = async (req, resp, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return resp.status(401).send({ message: "Access token missing or invalid" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        const user = await User.findById(decoded.id);
        if (!user) {
            return resp.status(401).send({ message: "User no longer exists" });
        }

        req.user = user;
        next();
    } catch (err) {
        return resp.status(403).send({ message: "Invalid or expired token" });
    }
};

//role based authorization

exports.adminOnly = (req,resp,next)=>{
    if(req.user.role !== 'admin'){
        return resp.status(403).send({message: "Admin access only"})
    }

    next();
};
