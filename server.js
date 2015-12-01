// server.js

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	hbs = require('hbs'),
	mongoose = require('mongoose'),
	request = require('request'),

	// auth
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy;

	// require and load dotenv
	require('dotenv').load();

var meetupKey = process.env.MEETUP_API_KEY;

//connect to mongoDB
mongoose.connect(
	process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://localhost/takeahike-app'
);

// require User model

var User = require('./models/user');


// tells express to use auth middleware
app.use(cookieParser());
app.use(session({
	secret: 'supersecretkey',
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// passport config, allow users to sign up, log in and out
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

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



// when zip code is entered on index page, returns results on takeahike page
app.get('/api/events', function(req, res) {
	var zipcode = req.query.zipcode;

	request.get({
		'url': 'https://api.meetup.com/2/open_events',
		'qs': {
			'sign': true,
			'photo-host': 'public',
			'topic': 'hiking,hike,hikes',
			'radius': 'smart',
			'zip': zipcode,
			'key': meetupKey
		}
	}, function(error, response, body) {
		console.log('meetup response error', error);
		if(!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			res.json({ events: info.results });
		}
	});
});




app.get('/takeahike', function(req, res) {

	res.render('takeahike');
		
});


// auth routes

// show signup view
app.get('/signup', function (req, res) {
	res.render('signup');
});

// show login view
app.get('/login', function (req, res) {
	res.render('login');
});



// sign up new user, then log them in, redirect to profile page

// hashes and salts passport, saves new user to db
app.post('/signup', function (req, res) {
	User.register(new User({ username: req.body.username}), req.body.password,
		function (err, newUser) {
			passport.authenticate('local')(req, res, function() {
				// res.send('signed up!');
				res.redirect('/profile');
			});
		}
	);
});

// log in user
app.post('/login', passport.authenticate('local'), function (req, res) {
	// res.send('logged in!');
	res.redirect('/profile');
});

// log out user
app.get('/logout', function (req, res) {
	req.logout();
	res.redirect('/');
});

// shows user profile page
app.get('/profile', function (req, res) {
	res.render('profile', {user: req.user});
});




// listen on port 3000
app.listen(process.env.PORT || 3000);
