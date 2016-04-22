var express = require('express');
var app = express();
var PORT = process.env.PORT || 5000;
var todos = [{
    id: 1,  // id for database (future)
    description: 'Celebrate Kristen\'s new job',
    completed: false
}, {
    id: 2,
    description: 'Fix shower door',
    completed: false
}, {
    id: 3,
    description: 'Secure tree',
    complete: true
}];

// simple get request
app.get('/', function(req, res) {
    res.send('Todo API root');
});

// HTTP method: GET /todos
app.get('/todos', function(req, res) {    
    res.json(todos); // converts todos to JSON and sends back to caller    
});

// HTTP method: GET /todos/:id
app.get('/todos/:id', function(req, res) {    
    res.send('Asking for ToDo with id of ' + req.params.id)
    var todoId = parseInt(req.params.id);
    var matchedTodo;
    
    // iterate todos array. Find the match or return 404
    todos.forEach(function (todo) {
        if (todoId === todo.id) {
            matchedTodo = todo;
        }
    });
    
    // undefined is false
    if (matchedTodo) {
        res.json(matchedTodo);
    } else {    
        res.status(404).send();        
    }
});

// listen
app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
});