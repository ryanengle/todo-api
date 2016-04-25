var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var db = require('./db.js');
var PORT = process.env.PORT || 5000;

var todos = [];
var todoNextId = 1;

// set up middleware
// can now access json request through req.body 
app.use(bodyParser.json());

// HTTP method: GET /todos
app.get('/todos', function(req, res) {    
    // Get request query params
    var query = req.query;
    var where = {};
    
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
app.get('/todos/:id', function(req, res) {
    // string and base
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.findById(todoId).then( function(todo) {
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

// HTTP method: POST /todos (all todos)
app.post('/todos', function(req, res) {
    // via body-parser and underscore
    var body = _.pick( req.body, 'description', 'completed');

    db.todo.create(body).then(function (todo) {
        // on success
        res.json(todo.toJSON());
    }, function (e) {
        // on error
        res.status(400).json(e);  // bad request   
    });

});

// HTTP method: DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    
    db.todo.destroy({
        where: {
            id: todoId
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

// HTTP method: PUT /todos/:id
app.put('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    // Check if the object exists
    if( !matchedTodo ){
        return res.status(404).send();
    }   
    
    // Perform validation on completed attribute
    var body = _.pick( req.body, 'description', 'completed');
    var validAttributes = {};
    // Validate attribute
    if ( body.hasOwnProperty('completed') && _.isBoolean(body.completed) ){
        validAttributes.completed = body.completed;
    } else if ( body.hasOwnProperty('completed') ) {
        // Has the property, but invalid
        return res.status(400).send();
    } 
    // Perform validation on description attribute
    if ( body.hasOwnProperty('description') && _.isString(body.description) &&
        body.description.trim().length > 0 ){
        validAttributes.description = body.description;
    } else if ( body.hasOwnProperty('description') ) {
        // Has the property, but invalid
        return res.status(400).send();
    } 
    
    // Perform the update
    matchedTodo = _.extend(matchedTodo, validAttributes);   
    res.json(matchedTodo);
    
});

db.sequelize.sync().then(function () {
    // listen
    app.listen(PORT, function() {
        console.log('Express listening on port ' + PORT);
    });
});

