var bcrypt = require('bcrypt');
var _ = require('underscore');

module.exports = function(sequelize, DataTypes){
    return sequelize.define('user', {
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
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON(); // this refers to instance
                return _.pick(json, 'id', 'email', 'createdAt', 'updatedAt');                
            }
        }
    });
};