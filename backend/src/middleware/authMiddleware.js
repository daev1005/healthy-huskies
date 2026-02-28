const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    // Check if Authorization header exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extract token
            token = req.headers.authorization.split(' ')[1];

            //  Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database (exclude password)
            req.user = await User.findById(decoded.id).select('-password -__v');

            // Continue to next middleware / controller
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
