var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes){
    var user = sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7,100]
            },
            // Override set function for this attribute
            set: function (value) {
                // generate salt
                var salt = bcrypt.genSaltSync(10);// number of chars for salt
                var hashedPasswd = bcrypt.hashSync(value, salt);
                
                // now set properties/attributes
                this.setDataValue('password', value); // won't be stored because virtual 
                this.setDataValue('salt', salt);
                this.setDataValue('password_hash', hashedPasswd);
            }
        }
    }, { // hook
        hooks: {
            beforeValidate: function (user, options) {
                // user.email to lowercase if string
                if (typeof user.email === 'string'){
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function (body) {
                // return a promise
                return new Promise( function (resolve, reject) {
                   // quick validation                   
                   if (typeof body.email !== 'string' || typeof body.password !== 'string'){                       
                       return reject(); // do not proceed
                   }                   
                   
                   // Find user email in DB
                   user.findOne( {
                       where: {
                           email : body.email // equal
                       }
                   }).then( function (user){
                       // promise returned success                       
                       if (!user) {                           
                           return reject(); // do not proceed
                       }       
                       // User found, now check password (could merge this into previous check)       
                       if (!bcrypt.compareSync (body.password, user.get('password_hash'))) {                           
                           return reject(); // do not proceed
                       }
                       
                       // User and password is authorized
                       resolve(user);                           
                   }, function (e) {
                       // promise returned failure                       
                       reject(e);
                   });                                       
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON(); // this refers to instance
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');                
            }
        }
    });
    return user;
};