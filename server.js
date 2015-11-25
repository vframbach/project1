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
	request.get('https://api.meetup.com/2/open_events?&sign=true&photo-host=public&zip=94111&topic=hiking,%20hike%20hikes&radius=smart&key='+ meetupKey, function(error, response, body) {
		console.log(error);	
		if(!error && response.statusCode == 200) {
			console.log(body);
		}
	});
});



// listen on port 3000
app.listen(3000, function() {
	console.log('server started');
});