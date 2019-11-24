var express = require('express');
var router = express.Router();
var _ = require('underscore');
var db = require('../db');
var Board = require('../db/board');
var he = require('he');


/* GET home page. */
router.get('/', async function(req, res, next) {

	if (req.session.userId) {
		db.query(Board.getBoardsByOwnerId(req.session.userId))
		.then(boards => {
			if (!boards.rows[0]) {
				return res.render('index');
			} else {
				return res.render('index', {boards: boards.rows})
			}
		})
	} else {
		return res.render('index');
	}

});

/* GET board */
router.get('/board/:boardid/', isPublic, isLoggedIn, async function(req, res, next) {
	db.query(Board.getPostsByBoardId(req.params.boardid))
	.then(posts => {
		if (!posts.rows[0]) {
			return res.render('board');
		} else {
			console.log(posts.rows[0])
			return res.render('board', {feed: posts.rows})
		}
	})
	.catch((err) => {
		console.log(err);
		return res.redirect('/');
	});
});

/* GET new post page */
router.get('/board/:boardid/new_post', isLoggedIn, async function(req, res, next) {
	res.render('submitpost');
});

/* POST new post to board */
router.post('/board/:boardid/new_post', isLoggedIn, isOwner, async function(req, res, next) {

	// console.log(Board.createPost(req.body, req.params.boardid, req.user));
	console.log(req.body.content);

	db.query(Board.createPost(req.body, req.params.boardid, req.user))
	.then(() => {
		console.log(`Added new post to board id: ${req.params.boardid}`)
		res.redirect(`/board/${req.params.boardid}/`);
	})
	.catch((err) => {
		console.log(err);
		return res.redirect('/');
	})
});

/* Delete post from board */
router.delete('/board/:boardid/:postid', isLoggedIn, isOwner, async function(req, res, next) {
	db.query(Board.deletePost(req.params.postid))
	.then(() => {
		console.log('- deleted post');
		return res.redirect(`/board/${req.params.boardid}/`);
	})
	.catch((err) => { 
		console.log(err);
		return res.redirect('/');
	})
});

/* GET update post page */
router.get('/board/:boardid/:postid/edit_post', isLoggedIn, async function(req, res, next) {
	db.query(Board.getPostByPostId(req.params.postid))
	.then((post) => {
		if (post.rows[0]) {
			console.log(post.rows);
			return res.render('editpost', {post: post.rows[0]})
		}
		return res.render('editpost', {error: 'Post does not exist'});
	})
	.catch((err) => { 
		console.log(err);
		return res.redirect('/');
	})
});

/* UPDATE post on board */
router.put('/board/:boardid/:postid/', isLoggedIn, isOwner, async function(req, res, next) {
	db.query(Board.editPost(req.body, req.params.postid, req.user))
	.then(() => {
		console.log('- updated post');
		return res.redirect(`/board/${req.params.boardid}/`);
	})	
	.catch((err) => { 
		console.log(err);
		return res.redirect('/');
	})
});

router.post('/board/update_boardlist', isLoggedIn, async function(req, res, next) {
	db.query(Board.getBoardsByOwnerId(req.session.userId))
	.then((boardlist) => {
		if (boardlist.rows[0]) {
			console.log(boardlist.rows)
			return res.render('partials/boardlist', {boardlist: boardlist.rows});
		}
	})
	.catch((err) => {
		console.log(err);
	})
});

router.post('/board/:boardid/update_content', isPublic, isLoggedIn, async function(req, res, next) {
	// update content element with post content

	db.query(Board.getPostByPostId(req.body.post_id))
	.then((post) => {
		if (post.rows[0]) {
			return res.render('partials/content', {post: post.rows[0]});
		}
	})
	.catch((err) => {
		console.log(err);
	})
})

router.post('/board/:boardid/update_filters', isPublic, isLoggedIn, async function(req, res, next) {
	// get filtered board feed
	console.log(req.body);

	var feed = [];

	db.query(Board.getFilteredPosts(req.body, req.params.boardid))
	.then((posts) => {
		console.log(posts.rows)
		if (posts.rows) {
			feed = _.clone(posts.rows);
			return res.render('partials/feed', {feed: feed})
		}
	})
	.catch((err) => {
		console.log(err);
	});

});

router.post('/board/:boardid/update_board', isPublic, isLoggedIn, async function(req, res, next) {

	// Update posts with new settings
	// get posts and render board again
	var feed = [];

	console.log(req.body);

	if (req.body.case = "pin") {
		db.query(Board.pinPosts(req.body.checked))
		.then(() => {
			db.query(Board.getPostsByBoardId(req.params.boardid))
			.then((posts) => {
				feed = _.clone(posts.rows);
				console.log(feed);
				return res.render('partials/feed', {feed: feed});
			})
		})
		.catch((err) => {
			console.log(err);
		})
	}
});



function isPublic(req, res, next) {
	db.query(Board.getBoardByBoardId(req.params.boardid))
	.then((board) => {
		if (board.rows[0].public) {
			console.log("- board is public");
			req.params.isPublic = true;
			return next();
		} else {
			console.log("- board is not public");
			return next();
		}
	});
}

function isLoggedIn(req, res, next) {
	if (req.params.isPublic) {
		console.log('Public board - skipping login check')
		return next();
	} else {
		if (!(req.session && req.session.userId)) {
			return res.redirect('/users/login');
		} else {
			console.log("- user is logged in");
			return next();
		}
	}
}

function isOwner(req, res, next) {
	db.query(Board.getBoardByBoardId(req.params.boardid))
	.then((board) => {
		if (board.rows[0] && board.rows[0].owner_id === req.session.userId) {
			console.log('- user owns board');
			return next();
		} else {
			console.log('- user does not own board. Redirecting.')
			return res.redirect('/users/login');
		}
	})
}

module.exports = router;
