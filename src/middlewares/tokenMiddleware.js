const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const ObjectId = require('mongoose').Types.ObjectId;

const validBsonId = (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id ) {
            console.log(id, postId);
            return res.status(400).json({ error: "Invalid id" });
        }
        if (id){
            if(!ObjectId.isValid(id)){
                return res.status(400).json({ error: "Invalid id" });
            }
        }
        next();
    }
    catch (error) {
        console.error("Error validating BsonId:",error);
        res.status(500).json({ error: "Server error. Please try again later." });
    }
}

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    // console.log(token);
    if (!token){
        return res.status(401).json({ error: 'Access denied'});
    }

    try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        req.userId = decoded.userId;
        next();
    }
    catch (error) { 
        console.error("Invalid token ", error)
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = {verifyToken, validBsonId};