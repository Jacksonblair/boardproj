var express = require('express');
var router = express.Router();
var _ = require('underscore');
var db = require('../db');
var Board = require('../db/board');


/* GET home page. */
router.get('/', isLoggedIn, async function(req, res, next) {

	db.query(Board.getBoardsByOwnerId(req.user.id))
	.then(boards => {
		if (!boards.rows[0]) {
			return res.render('index');
		} else {
			return res.render('index', {boards: boards.rows})
		}
	})

});

/* GET board */
router.get('/board/:boardid/', isPublic, isLoggedIn, async function(req, res, next) {

	db.query(Board.getPostsByBoardId(req.params.boardid))
	.then(posts => {
		if (!posts.rows[0]) {
			return res.render('board');
		} else {
			return res.render('board', {feed: posts.rows})
		}
	})

});

/* GET new post page */
router.get('/board/:boardid/new_post', async function(req, res, next) {
	res.render('submitpost');
});

/* Add new post to board */
router.post('/board/:boardid/new_post', async function(req, res, next) {
	console.log(req.body)
	console.log(req.params.boardid)
	db.query(Board.createPost(req.body, req.params.boardid))
	.then(() => {
		console.log(`Added new post to board id: ${req.params.boardid}`)
		res.redirect(`/board/${req.params.boardid}`);
	})
	.catch((err) => {
		console.log(err);
		return res.redirect('/');
	})
});

router.post('/ajax', async function(req, res, next) {
	// get filtered board feed
	console.log(req.body);

	var feed = [];

	try {
		var query = getFilterQuery(req.body)
		if (query) {
			var response = await db.query(query)	
			if (response.rows) {
				feed = response.rows
			}
		}
	} catch (err) {
		console.log(err);
	}

	res.render('feed', {feed: feed});
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

/* BUILD SQL QUERY MATCHING USER FILTERS */
function getFilterQuery(filter) {
	var query = `SELECT title, description, content, category,
				TO_CHAR(created, 'MON') AS month,
				EXTRACT(DAY from CREATED) AS day,
				EXTRACT(YEAR from CREATED) AS year 
				FROM posts WHERE `;

	console.log(query);

	/*filter by categories
	- Get allowed categories (which is an array), remove empties, add quotation marks, and join with commas (to parse in SQL query)
	- If no categories, just return a dud request */

	var allowedCategories 
	if (!(allowedCategories = getAllowedCategories(filter.categories)))
		return false;
	query += `category IN (${allowedCategories}) `;

	/*filter by search terms*/
	if (filter.search)
		query += `AND LOWER(description) LIKE ('%${filter.search}%') OR LOWER(title) LIKE ('%${filter.search}%') OR LOWER(content) LIKE ('%${filter.search}%') `

	/* filter by date function and date */
	if (filter.dateSetting) {
		switch(filter.dateSetting) {
			case "FROM":
				query += `AND created > ('${filter.date}') `;
				break;
			case "BEFORE":
				query += `AND created < ('${filter.date}') `;
				break;
			case "RANGE":
				query += `AND created BETWEEN '${filter.startdate}' AND '${filter.enddate}' `;
				break;
		}

	}

	query += 'ORDER BY created'
	console.log(query);
	return query;
}


function getAllowedCategories(categories) {
	// compares to returned database posts
	var availCategories = ["EVENT", "REMINDER", "ANNOUNCEMENT"];

	// checks truthyness of filter buttons for different categories and returns array to be checked against DB returned posts
	categories.forEach((category, index) => {
		if (!category) {
			availCategories[index] = "";
		}
	});

	return availCategories.filter(Boolean).map(function(cat) { return "'" + cat + "'" }).join(', ');;
}

// var boardSeed = [

// 	// Events, Announcement, Reminder

// 	{
// 		title: 'Big birthday party!',
// 		description: 'Suzies having a huge birthday omg',
// 		content: 'Birthday party occuring on the 4th of the 5th! Don\'t miss it or Suzy will crack the shits.',
// 		category: 'EVENT',
// 		author: 'Jimmy'
// 	}, {
// 		title: 'No more orgies at the office!',
// 		description: 'Sick of these damn orgies. Shit\'s insane. Jizz all over the shop',
// 		content: 'We\'ve had seven orgies this week and it\'s getting out of control. James slipped on some jizz and hurt his ankle so that\'s sucks. Chill out with the orgies damnit!',
// 		category: 'ANNOUNCEMENT',
// 		author: 'Jimmy'
// 	}, {
// 		title: 'Please label your sandwiches.',
// 		description: 'Sick of these damn unlabeled sandwiches.',
// 		content: 'Hi all i\'ve had several complaints about the sandwich bandit this week, but he or her only seems to be targeting those sloppy staff members who don\'t label their sandwiches. Please do so if you don\'t want the sandwich bandit to steal your lunch',
// 		category: 'REMINDER',
// 		author: 'Graham'
// 	}
// ]

// async function seed() {
// 	boardSeed.forEach(async function(post) {
// 		try {
// 			const res = await db.query('INSERT INTO posts (title, description, content, category, ) VALUES ($1, $2, $3, $4)', [post.title, post.description, post.content, post.category])
// 			console.log(res.rows[0])
// 		} catch (err) {
// 			console.log("err:", err);
// 		}
// 	})
// }

// seed();


module.exports = router;
