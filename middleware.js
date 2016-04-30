var cryptojs = require('crypto-js');

module.exports = function (db) {    
    return {
        requireAuthentication: function (req, res, next) {
            // get token from header
            var token = req.get('Auth') || '';
            
            // look for token in db (created during login)
            db.token.findOne({
               where: {
                   // from user's header
                   tokenHash: cryptojs.MD5(token).toString() 
               } 
            }).then(function (tokenInstance) {
                // if found in db
                if (!tokenInstance){
                    throw new Error();
                }                
                
                req.token = tokenInstance;
                return db.user.findByToken(token);                
                
            }).then(function (user) {
                req.user = user;  
                next();              
            }).catch(function () {
                res.status(401).send();
            });
        }  
    };
};