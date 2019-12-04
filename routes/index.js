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
			console.log(boards.rows);
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

/* GET new board creation page */
router.get('/board/new/', isLoggedIn, async function(req, res, next) {
	res.render('newboard');
});

/* POST new board */
router.post('/board/new/', isLoggedIn, async function(req, res, next) {
	db.query(Board.createBoard(req.body, req.session.userId))
	.then(() => {
		res.redirect('/')
	})
	.catch((err) => {
		console.log(err);
		return res.redirect('/', {error: err});
	})
});

/* GET board */
router.get('/board/:boardid/', isPublic, isLoggedIn, async function(req, res, next) {
	db.query(Board.getBoardByBoardId(req.params.boardid))
	.then(board => {
		db.query(Board.getPostsByBoardId(req.params.boardid))
		.then(posts => {
			if (!posts.rows[0]) {
				return res.render('board', { boardname: board.rows[0].name });
			} else {
				console.log(posts.rows[0])
				console.log(board.rows[0])
				return res.render('board', {feed: posts.rows, boardname: board.rows[0].name})
			}
		})
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
router.post('/board/:boardid/new_post', isLoggedIn, isOwnerOfBoard, async function(req, res, next) {

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

/* DELETE post from board */
router.delete('/board/:boardid/delete_post', isLoggedIn, isOwnerOfBoard, async function(req, res, next) {
	db.query(Board.deletePosts(req.body.checked, req.params.boardid))
	.then(() => {
		console.log(`- deleted post(s) with id(s): ${req.body.checked}`);
		db.query(Board.getPostsByBoardId(req.params.boardid))
		.then(posts => {
			if (posts.rows[0]) {
				return res.render('partials/feed', {feed: posts.rows});				
			}
		})
	})
	.catch((err) => { 
		console.log(err);
		return res.redirect('/');
	})
});

/* GET update post page */
router.get('/board/:boardid/:postid/edit_post', isLoggedIn, async function(req, res, next) {
	db.query(Board.getPostByPostId(req.params.postid))
	.then(post => {
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
router.put('/board/:boardid/:postid/', isLoggedIn, isOwnerOfBoard, async function(req, res, next) {
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

router.post('/board/update_boardlist', shouldLogIn, async function(req, res, next) {
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
			return res.render('partials/feed', {feed: post.rows})
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
				console.log(feed);
				return res.render('partials/feed', {feed: post.rows});
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
	// isPublic is set on GET requests to view boards
	// if the board is public, this check can be skipped
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

function shouldLogIn(req, res, next) {
	if (!(req.session && req.session.userId)) {
		console.log("- user needs to log in");
		return res.send(`<div class="item"> <span class="log-in-message"> <a href="/users/login"> Login </a> to use quick swap </span> </div>`);
	} else {
		console.log("- user is logged in");
		return next();
	}
}

// Checks if board.owner_id is same as user.id
function isOwnerOfBoard(req, res, next) {
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
