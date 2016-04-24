var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined, {
    'dialect': 'sqlite',  // type of database
    'storage': __dirname + '/basic-sqlite-database.sqlite' // storage location
});

// model definition (table)
var Todo = sequelize.define('todo', {
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            len: [1, 250] // only accept strings w/ length is 1 <= len <= 250 
        }
    }, 
    completed: {
        type: Sequelize.BOOLEAN, 
        allowNull: false, 
        defaultValue: false
    }
});

// force: false will not recreate tables      if they exist (default)
// force: true  will     recreate tables even if they exist
sequelize.sync({
    //force: true
}).then(function () {
    console.log('Everything is synced');
    
    // Todo.create({ // returns a promise
    //     description: 'Take out trash'        
    // }).then(function(todo) {
    //    return Todo.create( {
    //        description: 'Clean office'
    //    });
    // }).then (function () {
    //    //return Todo.findById(1);
    //    return Todo.findAll({
    //        where: {
    //            description: {
    //                 $like: '%Office%'    
    //            }               
    //        }
    //    });
    // }).then( function (todos) {
    //    if (todos) {
    //        todos.forEach(function (todo) {
    //         console.log(todo.toJSON());    
    //        });           
    //    } else {
    //        console.log('no todo found');
    //    }
    // }).catch( function(e) {
    //     console.log(e);
    // });
    
    Todo.findById(2).then(function (todo) {
       if (todo) {
           console.log(todo.toJSON());
       } else {
           console.log('todo not found');
       }
    });
    
});