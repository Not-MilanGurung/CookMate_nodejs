const jwt = require('jsonwebtoken');
const config = require('../configs/config');
const ObjectId = require('mongoose').Types.ObjectId;

const validBsonId = (req, res, next) => {
    try {
        const { id } = req.params;
        
        if (!id ) {
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
        jwt.verify(token, config.JWT_SECRET, function(err, decoded){
            if (err){
                return res.status(401).json({error : err.message});
            }
            else if (decoded){
                req.userId = decoded.userId;
                next();
            }
            else
                return res.status(401).json({ error: 'Invalid Token'});
        }) ;
    }
    catch (error) { 
        console.error("Invalid token ", error)
        return res.status(401).json({ error: 'Invalid token' });
    }
};

const tokenExpired =(req, res) => {
    const token = req.header('Authorization');
    // console.log(token);
    if (!token){
        return res.status(401).json({ error: 'Access denied'});
    }

    try {
        jwt.verify(token, config.JWT_SECRET, function(err, decoded){
            if (err){
                return res.status(401).json({error : err.message});
            }
            if (decoded){
                return res.status(200).json({ message: 'The token is valid', userId: decoded.userId, expires: decoded.exp});
            }
            if (!err && !decoded){
                return res.status(401).json({ error: 'Invalid Token'});
            }
        }) ;
    }
    catch (error) { 
        console.error("Invalid token ", error)
        return res.status(401).json({ error: 'Invalid token' });
    }
}
module.exports = {verifyToken, validBsonId, tokenExpired};