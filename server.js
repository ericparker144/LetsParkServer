// call the packages we need
var express = require('express');        // call express
var app = express();                 // define our app using express
var bodyParser = require('body-parser');

// The following code allows the API to be consumed by a specific domain. It adds to the headers of each server resonse.
// Without this code you will get the following errors:
// Without the first line of code [res.header('Access-Control-Allow-Origin', 'http://localhost:63963');]:
// --------> XMLHttpRequest cannot load http://localhost:8080/api/CreateUser. Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource. Origin 'http://localhost:63963' is therefore not allowed access.
// Without the second and third lines of code:
// --------> XMLHttpRequest cannot load http://localhost:8080/api/CreateUser. Request header field Content-Type is not allowed by Access-Control-Allow-Headers in preflight response.

// Update: 'http://localhost:63963' was changed to '*' to allow anyone to use this API

app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
    next();
});

// configure app to use bodyParser()
// this will let us get the data from a POST (enables req.body to contain the post data)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// Use the router created in router.js file
app.use('/api', require('./router'));

app.listen(port);
console.log('Magic happens on port ' + port);