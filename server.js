// server.js

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	hbs = require('hbs'),
	mongoose = require('mongoose'),
	request = require('request');

	// require and load dotenv
	require('dotenv').load();

var meetupKey = process.env.MEETUP_API_KEY;

//connect to mongoDB
mongoose.connect('mongodb://localhost/project1');

// require User model

var User = require('./models/user');



// configure body-parser (for form data)
app.use(bodyParser.urlencoded({ extended: true }));

// server static files from public folder
app.use(express.static(__dirname + '/public'));

// express will use hbs in views directory
app.set('view engine', 'hbs');



// API routes
app.get('/', function (req, res) {

	res.render('index');
});




app.get('/takeahike', function(req, res) {
	var zipcode = req.query.zipcode;
	request.get('https://api.meetup.com/2/open_events?&sign=true&photo-host=public&zip='+ zipcode +'&topic=hiking,%20hike%20hikes&radius=smart&key='+ meetupKey, function(error, response, body) {
		console.log(error);	
		if(!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			res.render("map", { events: info.results });
		}
	});
});



// listen on port 3000
app.listen(3000, function() {
	console.log('server started');
});