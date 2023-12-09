// middleware.js

const setUserLocals = (req, res, next) => {
    res.locals.user = req.user || null;
    next();
  };
  
  module.exports = { setUserLocals };
  