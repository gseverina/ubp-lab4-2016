var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));


/** DASHBOARD **/

app.get('/', function (req, res) {
    res.redirect('/login');
});


/** LOGIN **/

app.get('/login', function(req, res) {
    res.sendFile(__dirname + "/" + "login.html");
});

app.get('/login/:id', function(req, res) {
    var id = req.params.id;
    console.log("id: %s", id);
    res.sendFile(__dirname + "/" + "login-error.html");
});

app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == 'u' && password == 'p') {
        res.send("OK");
    }
    else{
      res.redirect("/login/1");
    }
});


/** REGISTER **/

app.get('/register', function(req, res) {
    res.sendFile(__dirname + "/" + "register.html");
});

app.get('/register/:id', function(req, res) {
    var id = req.params.id;
    console.log("id: %s", id);
    res.sendFile(__dirname + "/" + "register-error.html");
});

app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    if(username == 'u' && password == 'p') {
      res.redirect("/register/1");
    }
    else{
        res.send("OK");
    }
});


/** SERVER **/

var server = app.listen(8080, '127.0.0.1', function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log("example app listening at http://%s:%s", host, port);
});
