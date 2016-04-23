var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var _ = require('underscore');
var PORT = process.env.PORT || 5000;
// hard-coded todos
// var todos = [{
//     id: 1,  // id for database (future)
//     description: 'Celebrate Kristen\'s new job',
//     completed: false
// }, {
//     id: 2,
//     description: 'Fix shower door',
//     completed: false
// }, {
//     id: 3,
//     description: 'Secure tree',
//     complete: true
// }];

// // simple get request
// app.get('/', function(req, res) {
//     res.send('Todo API root');
// });
var todos = [];
var todoNextId = 1;

// set up middleware
// can now access json request through req.body 
app.use(bodyParser.json());

// HTTP method: GET /todos
app.get('/todos', function(req, res) {    
    res.json(todos); // converts todos to JSON and sends back to caller    
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
    
    if ( !(_.isBoolean(body.completed)) || !(_.isString(body.description)) ||
        body.description.trim().length === 0 ) {
        return res.status(400).send();
    }
    
    body.description = body.description.trim();
    
    body.id = todoNextId++;
    todos.push(body);
    
    res.json(body);
});

// HTTP method: POST ?? 


// listen
app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
});