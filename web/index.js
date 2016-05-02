var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    res.redirect('/login');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + "/" + "index.html");
});

app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == 'u' && password == 'p') {
        res.send("OK");
    }
    else{
        res.send("ERROR");
    }
});

app.get('/register', function(req, res) {
    res.sendFile(__dirname + "/" + "register.html");
});

app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == 'u' && password == 'p') {
        res.send("YA EXISTE");
    }
    else{
        res.redirect('/login');
    }
});

var server = app.listen(8080, '127.0.0.1', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("example app listening at http://%s:%s", host, port);
});
