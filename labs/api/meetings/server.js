var express = require('express');
var app = express();

app.get('/', function(req, res){
  res.send('BigBlueButton Meetings API');
});

app.get('/create', function(req, res) {
  res.send("Handling create api request");
});

app.get('/join', function(req, res) {
  res.send("Handling join api request");
});

app.get('/running', function(req, res) {
  res.send("Handling running api request");
});

app.get('/info', function(req, res) {
  res.send("Handling info api request");
});

app.get('/end', function(req, res) {
  res.send("Handling end api request");
});

app.get('/meetings', function(req, res) {
  res.send("Handling meetings api request");
});

app.get('/enter', function(req, res) {
  res.send("Handling enter api request");
});

app.get('/leave', function(req, res) {
  res.send("Handling leave api request");
});


app.listen(3000);
console.log('Listening on port 3000');

