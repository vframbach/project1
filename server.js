// server.js

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	hbs = require('hbs'),
	mongoose = require('mongoose'),
	request = require('request'),
	http = require('http').Server(app), // node http server
	io = require('socket.io')(http),

	// auth
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	MeetupOAuth2Strategy = require('passport-oauth2-meetup').Strategy;



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
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// serialize and deserialize
passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (obj, done) {
	done(null, obj);
});

// configure body-parser (for form data)
app.use(bodyParser.urlencoded({ extended: true }));

// server static files from public folder
app.use(express.static(__dirname + '/public'));

// express will use hbs in views directory
app.set('view engine', 'hbs');

// passport-meetup config
passport.use(new MeetupOAuth2Strategy({
	clientID: process.env.MEETUP_OAUTH_KEY,
	clientSecret: process.env.MEETUP_OAUTH_SECRET,
	callbackURL: process.env.MEETUP_CALLBACKURL,
	autoGenerateUsername: true
}, function (accessToken, refreshToken, profile, done)	{
	console.log('authed', accessToken);
	profile.accessToken = accessToken;
	return done(null, profile);
}));


// API routes
app.get('/', function (req, res) {

	res.render('index');
});



app.get('/takeahike', function(req, res) {

	res.render('takeahike',  {user: req.user});
		
});



// when zip code is entered on index page, returns results on takeahike page
app.get('/api/events', function(req, res) {
	var zipcode = req.query.zipcode;
	
	// meetup api parameters
	var qs = {
			'photo-host': 'public',
			'topic': 'hiking,hike,hikes',
			'page': 20,
			'radius': 'smart',
			'limited_events': true,
			'zip': zipcode
		};

		// if user is logged in through meetup and has access token, that will be used to get results
		// otherwise, my meetup access key will be used
		if (req.user && req.user.accessToken) {
			console.log('getting events with token', req.user.accessToken);
			qs.access_token = req.user.accessToken;
		} else {
			console.log('self signing');
			qs.sign = true; 
		 	qs.key = meetupKey;
		} 
			

	request.get({
		'url': 'https://api.meetup.com/2/open_events',
		'qs': qs


	}, function(error, response, body) {
		console.log('meetup response error', error);
		if(!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			res.json({ events: info.results });
		}
	});
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

//authenticate MEETUP request
app.get('/auth/meetup',
	passport.authenticate('meetup', { session: false }),
	function (req, res) {
		res.json(req.user);
	});

//redirect user after authenticating them with MEETUP
app.get('/auth/meetup/callback', passport.authenticate('meetup', { failureRedirect: '/login' }),
	function (req, res) {
		res.redirect('/profile');
	}
);

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
	console.log(req.user);
	res.render('profile', {user: req.user});
});

// web socket
// connect to socket
io.on('connection', function (socket) {
  console.log('user connected');

  // receive and broadcast chat messages
  socket.on('chat message', function (msg) {
    console.log('message:', msg);
    io.emit('chat message', msg);
  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });
});



// listen on port 3000
//app.listen(process.env.PORT || 3000);
http.listen(process.env.PORT || 3000, function() { // node http server
	console.log('server started');
});
