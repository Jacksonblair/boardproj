var createError = require('http-errors');
var express = require('express');
var methodOverride = require('method-override')
var app = express();
var path = require('path');
var logger = require('morgan');
var sessions = require('client-sessions'); 
var bodyParser = require('body-parser');
const db = require('./db');
const User = require('./db/user');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(methodOverride('_method'))
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))

// sessions
app.use(sessions({
	cookieName: "session",
	secret: process.env.SECRET,
	duration: 30 * 60 * 1000, // 30 mins
	httpOnly: true, 	// dont let js code access cookies
	secure: true 		// only set cookie is using https
}));

// smart user middleware
app.use((req, res, next) => {
	if (!(req.session && req.session.userId))
		return next();

	db.query(User.getOneById(req.session.userId))
	.then(user => {
		if (!user.rows[0])
			return next();

		// clear hashed password
		user.rows[0].password = undefined;

		req.user = user.rows[0];
		res.locals.user = user.rows[0];
		// console.log(res.locals.user);

		next();
	})
	.catch(err => {
		return next(err); 
	});
});

app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.locals.error = err;

  // render the error page
  res.status(err.status || 500);
  res.send(err);
});

module.exports = app;
