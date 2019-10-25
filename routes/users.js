const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const User = require('../db/user.js');
const db = require('../db');
const session = require('client-sessions');
const bcrypt = require('bcryptjs');

router.get('/', (req, res) => {
	res.redirect('./login');
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.get('/signup', (req, res) => {
	res.render('signup');
});

router.get('/logout', (req, res, next) => {
	req.session.reset();
	res.redirect('/');
});

router.post('/login', (req, res) => {
	db.query(User.getOneByEmail(req.body.email))
	.then(user => {
		// if invalid details
		if (!user.rows[0] || !bcrypt.compareSync(req.body.password, user.rows[0].password)) {
			return res.render('./login', { error: "Details do not match."});
		}

		// if valid details
		console.log('logged in succesfully');
		req.session.userId = user.rows[0].id;
		res.redirect('/');
	})
});

router.post('/signup', (req, res, next) => {
	let hash = bcrypt.hashSync(req.body.password, 14);
	req.body.password = hash;

	console.log(User.getOneByEmail(req.body.email))

	// check for existing user with e-mail
	if (validDetails(req.body)) {
		console.log('Details valid.')
		db.query(User.getOneByEmail(req.body.email))
		.then(user => {
			// if no existing user w that email
			if (!user.rows[0]) {
				console.log('Creating new user');
				db.query(User.createUser(req.body.email, req.body.password))
				.then(user => {
					return res.redirect('/');
				});
			} else {
				// email already in use
				console.log('User already exists withs that email')
				res.redirect('./signup');
			}
		})
		.catch(e => {
			console.log(e);
		})
	} else {
		// fail and redirect
		console.log('Invalid sign up details')
		res.redirect('./signup');
	}
});

function validDetails(user) {
	const validEmail = typeof user.email == 'string' && user.email.trim() != '';
	const validPassword = typeof user.password == 'string' && user.password.trim() != '';
	return validPassword && validEmail;
}

module.exports = router;