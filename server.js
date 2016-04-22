var express = require('express');
var app = express();
var PORT = process.env.PORT || 5000;

// simple get request
app.get('/', function(req, res) {
    res.send('Todo API root');
});

// listen
app.listen(PORT, function() {
    console.log('Express listening on port ' + PORT);
})