
$(document).ready(function(){

	$('.ui.checkbox').checkbox({
	    onChecked: function() {
	    	boardState.action.checked.push($(this).attr('value'));
	       	console.log(boardState.action.checked);
	    },
	    onUnchecked: function() {
	       	boardState.action.checked.splice(boardState.action.checked.indexOf($(this).attr('value')), 1);
	       	console.log(boardState.action.checked);
	    }
	});

	tinymce.init({
		selector: '#textarea'
	});

	$('.menu.tab-menu .item')
		.tab()
	;

	$('.ui.dropdown')
		.dropdown();

	$('.ui.sticky')
		.sticky({
		context: '.ui.column.main-column'
	});

	$('.ui.calendar').calendar({
		type: 'date',
		initialDate: null,
		today: true
	});

	$('#rangestart').calendar({
		type: 'date',
		today: true,
		endCalendar: $('#rangeend'),
		onChange: function (date, text, mode) {
			boardState.filters.startdate = JSON.stringify(date).substr(1, 10);
			updateBoardFilters();
		}
	});

	$('#rangeend').calendar({
		type: 'date',
		today: true,
		startCalendar: $('#rangestart'),
		onChange: function (date, text, mode) {
			boardState.filters.enddate = JSON.stringify(date).substr(1, 10);
			updateBoardFilters();
		}
	});

	$('#calendar').calendar({
		type: 'date',
		initialDate: null,
		today: true,
	    onChange: function (date, text, mode) {
			boardState.filters.date = JSON.stringify(date).substr(1, 10);
	    	updateBoardFilters();
    	}
	});

	$('.menu.calendar-menu .item').click(function() {
		var setting = $(this).text().trim();

		boardState.filters.dateSetting = setting;

		if (setting === "ALL") {
			$('#calendar, #rangestart, #rangeend').css({
				"display":"none"
			});
		} else if (setting === "RANGE") {
			$('#rangestart, #rangeend').css({
				"display":"inline-block"
			});
			$('#calendar').css({
				"display":"none"
			})
		} else if (setting === "FROM" || setting === "BEFORE") {
			$('#calendar').css({
				"display":"inline-block"
			})
			$('#rangestart, #rangeend').css({
				"display":"none"
			});
		}

		updateBoardFilters();

	})


	$('.category-check-item').click(function() {
		boardState.filters.category = $(this).attr('name');
	    updateBoardFilters();
	});

	$('#searchform').submit(function(e) {
		e.preventDefault();
		var search = $('#searchinput').val();
		boardState.filters.search = search.toLowerCase();
		updateBoardFilters();
	})

	// For changing tabs on mobile screen
	$('.post-segment-container')
	.on('click', function() {
		$('.item.content-item').addClass('active');
		$('.item.feed-item').removeClass('active');
		$.tab('change tab', 'second');
	});

	// function for updating list of available boards ON PC
	$('#boardlistdropdown')
	.on('click', function() {
		updateBoardList();
	});
	// ANd the same for MOBILE
	$('#boardlistdropdown')
	.on('click touchstart', function() {
		updateBoardList();
	});

});

function pinPosts() {
	boardState.action.type = "pin";
	updateBoard();
}

function searchformsubmit() {
	console.log('wot');
	var search = $('#searchinput').val();
	boardState.filters.search = search.toLowerCase();
	updateBoardFilters();
}

/* CONTENT VIEW FUNCTIONALITY */

function showSiblings(element) {
	var element = $(element);
	if (element.attr('value') == "hidden") {
		element.attr('value', 'shown');
		$(element).siblings('.post-segment-container').css('display', 'inline-block');
		$(element).siblings('.post-functionality-container').css('visibility', 'visible');
	} else {
		element.attr('value', 'hidden');
		$(element).siblings('.post-segment-container').css('display', 'none');
		$(element).siblings('.post-functionality-container').css('visibility', 'hidden');
	}
}

/* BOARD FILTER FUNCTIIONALITY */

var postToViewIndex;

var boardState = {
	filters: {
		category: "",
		dateSetting: 'ALL',
		date: "",
		enddate: "",
		startdate: "",
		search: ""
	},
	action: {
		type: "",
		checked: [],
		resetAction: function() {
			this.type = "",
			this.checked = [];
			return;
		}
	}
};

function updateBoardList() {
	console.log('updating list of avail. boards');
    $.ajax({
        type: 'post',
        url: '/board/update_boardlist'
    })
    .then(function(data) {
    	console.log(data);
    	$('#boardlistmenu').html(data)
  //   	$('.ui.dropdown')
		// .dropdown();
    });
}

/* Ajax request, called for each change to a filter element */
function updateContentViewer(post_id) {
	console.log('updating post content');
    $.ajax({
        type: 'post',
        url: './update_content',
        data: JSON.stringify({ post_id: post_id }),
        contentType: 'application/json'
    })
    .then(function(data) {
    	if (data) {
    		console.log(data);
	    	$('#contentcontainer').html(data);
	    	$('#mobilecontentcontainer').html(data);
	    	return;
    	}
    })
}

function updateBoard() {
	console.log('updating board');
    $.ajax({
        type: 'post',
        url: './update_board',
        data: JSON.stringify(boardState.action),
        contentType: 'application/json'
    })
    .then(function(data){
    	if (data) {

			// Reset boardstate
			boardState.action.resetAction();

        	$('#feedcolumn').html(data);
        	$('#mobilefeed').html(data);
        	// console.log(data);

        	// resetting checkbox functionality (DISSAPEARS ON AJAX RELOAD)
			$('.ui.checkbox').checkbox({
			    onChecked: function() {
			    	boardState.action.checked.push($(this).attr('value'));
			       	console.log(boardState.action.checked);
			    },
			    onUnchecked: function() {
			       	boardState.action.checked.splice(boardState.action.checked.indexOf($(this).attr('value')), 1);
			       	console.log(boardState.action.checked);
			    }
			});

			return;
    	}
    });
}

function updateBoardFilters() {

	console.log('updating filters...')
	console.log(boardState.filters)

    $.ajax({
        type: 'post',
        url: './update_filters',
        data: JSON.stringify(boardState.filters),
        contentType: 'application/json',
        async: false
    })
    .then(function(data){
    	console.log('updating stuff')
    	console.log(data)
    	if (data) {
    		// console.log(data);
        	$('#feedcolumn').html(data);
        	$('#mobilefeed').html(data);

        	// resetting tab swap functionality (DISSAPEARS ON AJAX RELOAD)

			$('.ui.checkbox').checkbox({
			    onChecked: function() {
			    	boardState.action.checked.push($(this).attr('value'));
			       	console.log(boardState.action.checked);
			    },
			    onUnchecked: function() {
			       	boardState.action.checked.splice(boardState.action.checked.indexOf($(this).attr('value')), 1);
			       	console.log(boardState.action.checked);
			    }
			});

			$('.menu.tab-menu .item')
				.tab();

			$('.post-segment-container')
			.on('click', function() {
				$('.item.content-item').addClass('active');
				$('.item.feed-item').removeClass('active');
				$.tab('change tab', 'second');
			});

        	// console.log(data);
    	} else {
			console.log('wot');  		
    	}
    });

}