var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',  // type of database
    // storage location
    'storage': __dirname + '/data/dev-todo-api.sqlite'
        // will fail if directory does not exist, thus use .keep for git    
});

var db = {};

db.todo  = sequelize.import(__dirname + '/models/todo.js');
db.user  = sequelize.import(__dirname + '/models/user.js');
db.token = sequelize.import(__dirname + '/models/token.js');

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Create associations
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);

module.exports = db;