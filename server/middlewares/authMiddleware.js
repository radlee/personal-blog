// authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const jwtSecret = process.env.JWT_SECRET;

const publicRoutes = ['/admin', '/main']; // Add other public routes as needed

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;

        // Skip authentication for public routes
        if (publicRoutes.includes(req.path)) {
            return next();
        }

        if (!token) {
            req.flash('error', 'Unauthorized. Please Login or Register');
            return res.redirect('/admin');
        }

        try {
            const decoded = jwt.verify(token, jwtSecret);
            const user = await User.findById(decoded.userId).select('-password');
            
            if (!user) {
                req.flash('error', 'Unauthorized. Please Login or Register');
                return res.redirect('/admin');
            }

            res.locals.user = user; // Set user in res.locals
    
            next();
        } catch (error) {
            console.log('Token verification error:', error);
            req.flash('error', 'Unauthorized. Please Login or Register');
            return res.redirect('/admin');
        }
    } catch (error) {
        console.log('Authentication error:', error);
        req.flash('error', 'Unauthorized. Please Login or Register');
        return res.redirect('/admin');
    }
};

module.exports = authMiddleware;
