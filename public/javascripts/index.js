
$(document).ready(function(){

	$('a.feed-tool-edit-link').click(function() {
		$('#feedtools .tools').css('display', 'none');
		$('#feedtools .edit-tools').css('display', 'inline');
		$('.ui.header.post-day').hide();
		$('.ui.checkbox.post-select-checkbox').show();
		$('.ui.checkbox.post-select-all-checkbox').show();
	});

	$('a.feed-tool-back-link').click(function() {
		$('#feedtools .tools').css('display', 'inline');
		$('#feedtools .edit-tools').css('display', 'none');
		$('.ui.header.post-day').show();
		$('.ui.checkbox.post-select-checkbox').hide();
		$('.ui.checkbox.post-select-all-checkbox').hide();
	});

	$('.ui.checkbox.post-select-all-checkbox').checkbox({
		onChecked: function() {
			$('.ui.checkbox.post-select-checkbox').each(function() {
				$(this).checkbox('check')
			})
		},
		onUnchecked: function() {
			$('.ui.checkbox.post-select-checkbox').each(function() {
				$(this).checkbox('uncheck')
			})
		}
	});

	$('.ui.form')
	  .form({
	    fields: {
	      email : 'empty',
	      password : ['minLength[6]', 'empty']
	    }
	  });

	var monthObj = ['january', 'february', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

	$('.ui.header.feed-month-header').each(() => {
		$(this).text(monthObj[$(this).text() - 1])
	})

	$('.ui.header.feed-month-header').each(() => {
		$(this).css("border", "1px solid red")
	})

	$('.ui.checkbox.post-select-checkbox').checkbox({
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
		context: '#contentcolumn'
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
		if (detectmob())
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

/* BOARD STATE */

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

function deletePost() {
	console.log('deleting post(s)');
    $.ajax({
        type: 'delete',
        url: './delete_post',
        data: JSON.stringify({ checked: boardState.action.checked}),
        contentType: 'application/json'
    })
    .then(function(data) {
    	if (data) {
			// Reset boardstate
			boardState.action.resetAction();

        	$('#feedcolumn').html(data);
        	$('#mobilefeed').html(data);
        	// console.log(data);

        	reloadFeedJquery();
	    	return;
    	}
    })
}

function updateBoardList() {
	console.log('updating list of avail. boards');
    $.ajax({
        type: 'post',
        url: '/board/update_boardlist'
    })
    .then(function(data) {
    	console.log('wot');
    	$('#boardlist').html(data)
    });
}

/* Ajax request, called for each change to a filter element */
function updateContentViewer(post_id) {
	console.log('updating post content');

	$('#contentcontainer').html(`<br><br><div class="ui center aligned header">Loading</div>`);

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

    		$('.ui.sticky')
				.sticky({
				context: '#contentcolumn'
			});
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

        	reloadFeedJquery();
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
        	reloadFeedJquery();
    	}
    });

}

function reloadFeedJquery() {
	
	// semantic function for checking individual checkboxes
	$('.ui.checkbox.post-select-checkbox').checkbox({
	    onChecked: function() {
	    	boardState.action.checked.push($(this).attr('value'));
	       	console.log(boardState.action.checked);
	    },
	    onUnchecked: function() {
	       	boardState.action.checked.splice(boardState.action.checked.indexOf($(this).attr('value')), 1);
	       	console.log(boardState.action.checked);
	    }
	});

	// semantic function for checking ALL checkboxes
	$('.ui.checkbox.post-select-all-checkbox').checkbox({
		onChecked: function() {
			$('.ui.checkbox.post-select-checkbox').each(function() {
				$(this).checkbox('check')
			})
		},
		onUnchecked: function() {
			$('.ui.checkbox.post-select-checkbox').each(function() {
				$(this).checkbox('uncheck')
			})
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
}

function detectmob() { 
 if( navigator.userAgent.match(/Android/i)
 || navigator.userAgent.match(/webOS/i)
 || navigator.userAgent.match(/iPhone/i)
 || navigator.userAgent.match(/iPad/i)
 || navigator.userAgent.match(/iPod/i)
 || navigator.userAgent.match(/BlackBerry/i)
 || navigator.userAgent.match(/Windows Phone/i)
 ){
    return true;
  }
 else {
    return false;
  }
}