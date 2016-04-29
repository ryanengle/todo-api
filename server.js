var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);// pass in db

var app = express();
var PORT = process.env.PORT || 5000;
var todos = [];
var todoNextId = 1;

// set up middleware
// can now access json request through req.body 
app.use(bodyParser.json());

// HTTP method: GET /todos?completed=false&q=work
app.get('/todos', middleware.requireAuthentication, function(req, res) {    
    // Get request query params
    var query = req.query;
    var where = {
        userId: req.user.get('id')
    };
    
    if (query.hasOwnProperty('completed') && query.completed === 'true') {
        where.completed = true;
    } else if (query.hasOwnProperty('completed') && query.completed ==='false') {
        where.completed = false;
    }
    
    if (query.hasOwnProperty('q') && query.q.length > 0) {
        where.description = {
            $like: '%' + query.q + '%'            
        };
    }
    
    db.todo.findAll({where:where}).then(function (todos) {
        // promise returned success
        res.json(todos);
    }, function (e) {
        // promise returned success
        res.status(500).send();
    });    
     
});

// HTTP method: GET /todos/:id
app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
    // string and base
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then( function(todo) {
       // promise returned success
       if (!!todo) { // !! convert object to boolean true or false, only runs if there is a todo item
            res.json(todo.toJSON());           
       } else {
           res.status(404).send();
       } 
    }, function (e) {
        // promise returned failure
        res.status(500).send();        
    });
        
});

// HTTP method: POST /todos (add a todo)
app.post('/todos', middleware.requireAuthentication, function(req, res) {
    // via body-parser and underscore
    var body = _.pick( req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        // on success        
        req.user.addTodo(todo).then(function () { // via middleware
            // reload todo
            return todo.reload();
        }).then(function (todo) { // reloaded todo
            res.json(todo.toJSON());
        }); 
    }, function (e) {
        // on error
        res.status(400).json(e);  // bad request   
    });

});

// HTTP method: DELETE /todos/:id
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then( function (numRowsDeleted) {
        // promise returned success
        if (numRowsDeleted === 0) {
            res.status(404).json({
                error: 'No ToDo with id'
            });
        } else {
            res.status(204).send(); // Success, no data to return
        }
    }, function () {
        // promise returned failure
        res.status(500).send(); // internal server error        
    });  
});

// HTTP method: PUT /todos/:id (Update)
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {
    var todoId = parseInt(req.params.id, 10);    
    var body = _.pick( req.body, 'description', 'completed');
    var attributes = {};
    
    // Validation is abstracted to model (models/todo.js)
    if ( body.hasOwnProperty('completed') ){
        attributes.completed = body.completed;
    }
    
    if ( body.hasOwnProperty('description')  ){
        attributes.description = body.description;
    } 
    
    db.todo.findOne({
        where: {
            id: todoId,
            userId: req.user.get('id')
        }
    }).then( function(todo) {
        // findById() promise returns success
        if (todo) {
            // chaining promises begins here (next then)
            todo.update(attributes).then( function (todo) {         
                // promise chain from todo.update(attributes)
                // todo.update() success
                // todo now has updated attributes
                res.json(todo.toJSON());
            }, function (e) {
                // todo.update() failure
                res.status(400).json(e); // invalid syntax
            }); 
        } else {
            res.status(404).send(); // not found
        }
    }, function () {
        // findById() promise returns failure
        res.status(500).send();
    });
});

// POST /users
app.post('/users', function(req, res) {
    var body = _.pick(req.body, 'email', 'password');
    
    db.user.create(body).then( function(user){
        // promise returned success
        res.json(user.toPublicJSON()); 
    }, function(e) {
        // promise returned failue
        res.status(400).json(e);
    });
});

// POST /users/login
app.post('/users/login', function(req, res) {
   var body = _.pick(req.body, 'email', 'password');
   
   db.user.authenticate(body).then( function (user) {
       // promise returned success              
       var token =user.generateToken('authentication');
       if (token) {
           res.header('Auth', token).json(user.toPublicJSON());    
       } else {
           res.status(401).send();
       }
       
   }, function (e) {
       // promise returned failure       
       res.status(401).send();  // authentication is possible, but failed       
   });

});

// {force: true} in sync() recreates DB
db.sequelize.sync({logging:console.log}).then(function () {
    // listen
    app.listen(PORT, function() {
        console.log('Express listening on port ' + PORT);
    });
});

