var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var handlebars = require('express-handlebars')
    .create({ defaultLayout:'main' });

var Log = require('log')
var log = new Log('info');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.get('/', function (req, res) {
    res.redirect('/login');
});

/** DASHBOARD **/

app.get('/dashboard', function(req, res) {
    /*
    log.info("DASHBOARD...");
    var jobs = {
        "jobs": [
            {
                "filterId": "1",
                "jobId": "fc8f58f6-d583-44be-b65b-0d142c6317c8",
                "originalImageUrl": "originalUrl",
                "status": "IN_PROCESS"
            },
            {
                "filterId": "2",
                "jobId": "ac8f58f6-d583-44be-b65b-0d142c6317c8",
                "originalImageUrl": "originalUrl",
                "status": "COMPLETED"
            }        
        ]
    };

    res.render('dashboard', jobs);

    */
    var options = {
        uri: 'http://img-proc-api-svc:8082/jobs',
        method: 'GET',

        headers: {
            "Content-type": "application/json"
        }
    };

    request(options, function (error, response, body) {
        log.info("DASHBOARD...");
        if (!error && response.statusCode == 200) {
            log.info(body);
            var jobs = {};
            try {
                jobs = JSON.parse(body);
            } catch(e) {
                log.info("body is not a valid JSON: %s", body);
                res.redirect("/login/1");
            }
            res.render('dashboard', jobs);
        } else {
            log.info("response.statusCode: %s", response.statusCode);
            res.redirect("/login/1");
        }
    });
});

/** CREATE JOB **/

app.get('/createjob', function(req, res) {
    res.render('createjob');
});

/** LOGIN **/

app.get('/login', function(req, res) {
    //res.sendFile(__dirname + "/" + "login.html");
    res.render('login')
});

app.get('/login/:id', function(req, res) {
    var id = req.params.id;
    res.render('login',{error_message: "AUTHENTICATION ERROR"})
});

app.post('/login', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var options = {
      uri: 'http://auth-svc:8081/login',
      method: 'POST',

      headers: {
        "Content-type": "application/json"
      },

      json: {
        "username": username,
        "password": password
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        log.info(body);
        console.log(body.status);
        if(body.status == "OK") {
            res.redirect('/dashboard');
        } else {
            res.redirect("/login/1");
        }
      }
    });
});


/** REGISTER **/

app.get('/register', function(req, res) {
    res.render('register')
});

app.get('/register/:id', function(req, res) {
    var id = req.params.id;
    res.render('register',{error_message: "USER ALREADY EXISTS"})
});

app.post('/register', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;

    var options = {
      uri: 'http://auth-svc:8081/register',
      method: 'POST',

      headers: {
        "Content-type": "application/json"
      },

      json: {
        "username": username,
        "password": password
      }
    };

    request(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        console.log(body.status);
        if(body.status == "OK") {
            res.render("home");
        } else {
            res.redirect("/register/1");
        }
      }
    });

});


/** SERVER **/

var server = app.listen(8080, '0.0.0.0', function () {
  var host = server.address().address;
  var port = server.address().port;

  log.info("example app listening at http://%s:%s", host, port);
    //console.log("example app listening at http://%s:%s", host, port);
});
