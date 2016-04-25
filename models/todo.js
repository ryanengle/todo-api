module.exports= function(sequelize, DataTypes){
    // copied from basic-sqlite-database.js
    return sequelize.define('todo', {
        description: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 250] // only accept strings w/ length is 1 <= len <= 250 
            }
        }, 
        completed: {
            type: DataTypes.BOOLEAN, 
            allowNull: false, 
            defaultValue: false
        }
    });
};