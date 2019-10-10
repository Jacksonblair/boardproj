var express = require('express');
var router = express.Router();
var _ = require('underscore');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {feed: boardSeed});
});

router.post('/ajax', function(req, res, next) {
	console.log(req.body.categories);
	// get filtered board seed
	res.render('feed', { feed: filterFeed(req.body) });
});

module.exports = router;

function filterFeed(filter) {
	var filteredFeed;

	// filter by categories
	var allowedCats = getAllowedCategories(filter.categories);
	filteredFeed = boardSeed.filter(function(post) {
		return post.category === allowedCats[0] || post.category === allowedCats[1] || post.category === allowedCats[2];
	});

	

	return filteredFeed;
}

function getAllowedCategories(categories) {
	// compares to returned database posts
	var availCategories = ["EVENT", "REMINDER", "ANNOUNCEMENT"];

	// checks truthyness of filter buttons for different categories and returns array to be checked against DB returned posts
	categories.forEach((category, index) => {
		if (!category) {
			console.log(category, " ", index);
			availCategories[index] = "";
		}
	});

	return availCategories;
}

var boardSeed = [

	// Events, Announcement, Reminder

	{
		title: 'Big birthday party!',
		description: 'Suzies having a huge birthday omg',
		content: 'Birthday party occuring on the 4th of the 5th! Don\'t miss it or Suzy will crack the shits.',
		category: 'EVENT',
		author: 'Jimmy',
		postDate: '28/04/10',
		time: '04:25'
	}, {
		title: 'No more orgies at the office!',
		description: 'Sick of these damn orgies.',
		content: 'We\'ve had seven orgies this week and it\'s getting out of control. James slipped on some jizz and hurt his ankle so that\'s sucks. Chill out with the orgies damnit!',
		category: 'ANNOUNCEMENT',
		author: 'Jimmy',
		postDate: '4/05/10',
		time: '04:25'
	}, {
		title: 'Please label your sandwiches.',
		description: 'Sick of these damn unlabeled sandwiches.',
		content: 'Hi all i\'ve had several complaints about the sandwich bandit this week, but he or her only seems to be targeting those sloppy staff members who don\'t label their sandwiches. Please do so if you don\'t want the sandwich bandit to steal your lunch',
		category: 'REMINDER',
		author: 'Graham',
		postDate: '12/04/10',
		time: '04:25'
	}
]