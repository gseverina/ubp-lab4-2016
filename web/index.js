var express = require('express');
//var busboy = require('express-busboy');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var request = require('request');
var handlebars = require('express-handlebars')
    .create({ defaultLayout:'main' });

var Log = require('log')
var log = new Log('info');

var app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
//app.use(busboy());
app.use(fileUpload());

app.get('/', function (req, res) {
    res.redirect('/login');
});

/** DASHBOARD **/

app.get('/dashboard', function(req, res) {

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
    res.render('upload');
});

app.post('/jobs', function(req, res) {
    console.log("filterId: %s", req.body.filterId);
    var filerId = req.body.filterId;
    var sampleFile;

    if (!req.files) {
        res.send('No files were uploaded.');
        return;
    }

    sampleFile = req.files.sampleFile;
    var base64data = new Buffer(sampleFile.data, 'binary').toString('base64');

    var options = {
        uri: 'http://storage-svc:8083/file',
        method: 'POST',

        headers: {
            "Content-type": "application/json"
        },

        json: {
            "content": base64data,
            "contentType":"image/jpeg"
        }
    };

    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            log.info(body);
            console.log(body.status);
            if(body.status == "OK") {
                var fileId = body.fileId;
                console.log("Uploaded file %s", fileId);

                var options = {
                    uri: 'http://img-proc-api-svc:8082/jobs',
                    method: 'POST',

                    headers: {
                        "Content-type": "application/json"
                    },

                    json: {
                        "originalImageUrl": "http://storage-svc:8083/file/" + fileId,
                        "filterId": filerId
                    }
                };

                request(options, function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        log.info("POST /jobs result: %s", body);
                        console.log(body.status);
                        if (body.status == "OK") {
                            res.redirect('/dashboard');
                        } else {
                            res.redirect("/dashboard/1");
                        }
                    }
                });
            } else {
                res.redirect("/dashboard/1");
            }
        }
    });
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
