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
    var queryParams = req.query;
    // make a copy of the todos
    var filteredTodos = todos; 
    
    // perform filtering
    if (queryParams.hasOwnProperty('completed') && 
        queryParams.completed === 'true') {
        filteredTodos = _.where(filteredTodos, {completed: true});
    } else if (queryParams.hasOwnProperty('completed') && 
               queryParams.completed === 'false') {
        filteredTodos = _.where(filteredTodos, {completed: false});
    }    
    
    // Search description (case insensitive)
    if (queryParams.hasOwnProperty('q') && queryParams.q.length > 0) {
        filteredTodos = _.filter(filteredTodos, function (todo) {
            //return todo.description.indexOf(queryParams.q) > -1;
            return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1;
        });
    }
    
    // converts (filtered)todos to JSON and sends back to caller
    res.json(filteredTodos);    
     
});

// HTTP method: GET /todos/:id
app.get('/todos/:id', function(req, res) {
    // string and base
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
   
    // undefined is false
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {    
        res.status(404).send();        
    }
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
        res.status(400).json(e);        
    });
                
    // if ( !(_.isBoolean(body.completed)) || !(_.isString(body.description)) ||
    //     body.description.trim().length === 0 ) {
    //     return res.status(400).send();
    // }
    
    // body.description = body.description.trim();
    
    // body.id = todoNextId++;
    // todos.push(body);
    
    // res.json(body);
});

// HTTP method: DELETE /todos/:id
app.delete('/todos/:id', function(req, res) {
    var todoId = parseInt(req.params.id, 10);
    var matchedTodo = _.findWhere(todos, {id: todoId});
    
    if (!matchedTodo) {
        res.status(404).json({"error": "no todo found with that id"});
    } else {
        todos = _.without(todos, matchedTodo);
        res.json(matchedTodo); // sets status to 200
    }

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

