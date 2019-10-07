var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {num: [1, 2, 3, 4, 5, 6, 7, 8, 10]});
});

router.post('/ajax', function(req, res, next) {
	console.log(req.body.categories);
});

module.exports = router;