
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


	$('button.category-input-button').click(function() {
	    var state = $(this).val(); // get value of button
	    var a = state.slice(0); // copy by value
	    var index = $(this).index() - 1;

	    if (a === "1") {
	    	$(this).val("2");
		    $(this).css({
		    	'color':"#e6e6e6",
		    	'background':"white"
		    })
		    boardState.filters.categories[index] = false;
	    } else if (a === "2") {
	    	$(this).val("1")
		    $(this).css({
		    	'color':"black",
		    	'background':'whitesmoke'
		    })
		    boardState.filters.categories[index] = true;
	    } 

	    updateBoardFilters();
	});

	$('#searchform').submit(function(e) {
		e.preventDefault();
		var search = $('#searchinput').val();
		boardState.filters.search = search.toLowerCase();
		updateBoardFilters();
	})

	// For  changing tabs on mobile screen
	$('.post-segment-container')
	.on('click', function() {
		$('.item.content-item').addClass('active');
		$('.item.feed-item').removeClass('active');
		$.tab('change tab', 'second');
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

function showContent(post) {
	// document.getElementById('contentviewerpostdeletebutton').attributes.action = `./${post.id}?_method=DELETE`;
	console.log(document.getElementById('postcontentdeleteform').attributes.action.value = `./${post.id}?_method=DELETE`);
	console.log(document.getElementById('postcontenteditbutton').attributes.href.value = `./${post.id}/edit_post`);
	console.log(document.getElementById('mobilepostcontentdeleteform').attributes.action.value = `./${post.id}?_method=DELETE`);
	console.log(document.getElementById('mobilepostcontenteditbutton').attributes.href.value = `./${post.id}/edit_post`);
	// .ui.header.content-viewer-post-description
}

/* BOARD FILTER FUNCTIIONALITY */

var postToViewIndex;

var boardState = {
	filters: {
		categories: [ 
			true,
			true,
			true 
		],
		dateSetting: 'ALL',
		date: "",
		enddate: "",
		startdate: "",
		search: "",
		updateCategory: function(state, index) {
			this.categories[index] = state;
			return;
		}
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
	    	$('#contentcolumn').html(data);
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
        	// console.log(data);
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
        contentType: 'application/json'
    })
    .then(function(data){
    	if (data) {
    		// console.log(data);
        	$('#feedcolumn').html(data);
        	// console.log(data);
    	} else {
			console.log('wot');  		
    	}
    });

}