    // This file returns the router for the API as a module
    var express = require('express');
    var bcrypt = require('bcryptjs');

    // For MySQL Connection
    var mysql = require('mysql');
    var connection = mysql.createConnection({
        host: 'db4free.net',
        user: 'letspark1234',
        password: 'LetsPark1234',
        database: 'letsparkdb'
    });
    connection.connect();

    var router = express.Router();

    // test route to make sure everything is working (accessed at GET http://localhost:8080/api)
    router.get('/', function (req, res) {
        res.json({ message: 'hooray! welcome to our api!' });
    });



    // Connect to MySQL Database (accessed at GET http://localhost:8080/api/GetLetsParkUsers)
    router.route('/GetLetsParkUsers').get(function (req, res) {
        
        var query = connection.query('SELECT user_ID, user_name, first_name, last_name FROM users', function (err, rows, fields) {
            if (!err)
                res.json(rows);
            else
                res.json({ message: 'No good.' });
            
        });
    });

    // Create new user [HTTP POST the data]
    router.route('/CreateUser').post(function (req, res) {

        bcrypt.genSalt(10, function(err, salt) {
        
        bcrypt.hash(req.body.password, salt, function(err, hash) {


        var post = {
            user_name: req.body.user_name,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            password: hash
        };

        var query = connection.query("INSERT INTO users SET user_ID = UUID(), user_name = ?, first_name = ?, last_name = ?, password = ?", [post.user_name, post.first_name, post.last_name, post.password], function (error, rows, fields) {
            if (!error)
                res.json("Success");
            else {
                res.json("No Good");
            }
        });

        console.log(query.sql);

        });
    });

    });

    // Return "Success" when user supplies correct password
    router.route('/Login').post(function (req, res) {

    	var user = {
    		user_name: req.body.user_name,
    		password: req.body.password		
    	}

    	connection.query('SELECT user_ID, first_name, last_name, password FROM users WHERE user_name = ?', [user.user_name], function (err, result, fields) {
    		if (!err) {
    			if (result.length < 1)
    				res.json({ login: "Not a Let's Park user"});
    			else {
    				bcrypt.compare(user.password, result[0].password.toString(), function(error, resp) {
                    if (error) {
                        res.json({login: "No good"});
                    }
                    else {
                        if (resp == true) {

                            var responseObj = {
                                login: "Success",
                                user_ID: result[0].user_ID,
                                first_name: result[0].first_name,
                                last_name: result[0].last_name
                            };

                            res.json(responseObj);


                        }
                        else {
                            res.json({login: "No good"});
                        }
                    }

                    });
                }
    		}
    		else
                res.json({ login: "Failure to connect to Database"});
    	})

    });


    // Get all Parking spots that are still available (i.e. NOW is earlier than end_time)
    // NEED TO CONVERT TIMEZONE CORRECTLY
    // Currently not displaying all spots that should be available
    router.route('/GetAllSpots').get(function (req, res) {

    	var query = connection.query('SELECT spot_ID, user_ID, latitude, longitude, start_time, end_time, price, description FROM spots WHERE end_time > CONVERT_TZ(NOW(), "CET", "EST")', function (err, rows, fields) {
            if (!err) {
            	 console.log(query);
                res.json(rows);
            }
            else
                res.json({ message: 'No good.' });        
        });
    });

    router.route('/Spots').get(function (req, res) {

    	var query = connection.query('SELECT * FROM spots', function (err, rows, fields) {

    		if (!err)
    			res.json(rows);
    		else
    			res.json({ message: 'No good.' });

    	})

    });

    // Add a Parking Spot
    router.route('/CreateParkingSpot').post(function (req, res) {
    	var post = {
            user_ID: req.body.user_ID,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            price: req.body.price,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            description: req.body.description
        };

        console.log(post);

        // For some reason, post object is perfect every time, but MySQL adds 5 hours to every single time (both start_time and end_time)
        // The error occurs in the query
        // A quick fix has been to the post object to accomodate this using DATE_SUB to subtract 5 hours from all dates being posted
        // THIS IS PROBABLY NOT THE BEST SOLUTION AND SHOULD BE CHANGED

        var query = connection.query('INSERT INTO spots SET spot_ID = UUID(), user_ID = ?, latitude = ?, longitude = ?, price = ?, start_time = DATE_SUB(STR_TO_DATE(?,"%Y-%m-%d %H:%i:%s"), INTERVAL 5 HOUR), end_time = DATE_SUB(STR_TO_DATE(?,"%Y-%m-%d %H:%i:%s"), INTERVAL 5 HOUR), description = ?',
            [post.user_ID, post.latitude, post.longitude, post.price, post.start_time, post.end_time, post.description], function (err, rows, fields) {
            
            if (!err)
                res.json("Success");
            else {
                console.log(err.stack);
                res.json("No Good");
            }
        });
    });

    // Get all Parking spots currently available by a particular user
    // ':' indicates a route parameter. Example use: "/GetMySpots/0f43e570-a6e4-11e6-93ca-448a5b2c2d83"
    router.route('/GetMySpots/:user_ID').get(function (req, res) {

        var user = req.params.user_ID;

        var query = connection.query('SELECT spot_ID, latitude, longitude, start_time, end_time, price, description FROM spots WHERE end_time > NOW() AND user_ID = ?', [user], function (err, rows, fields) {
            if (!err)
                res.json(rows);
            else
                res.json('No good');        
        });
    });

    // Export the module so that it can be used via 'require'
    module.exports = router;