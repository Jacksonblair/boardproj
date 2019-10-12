
// $(document).ready(function(){
//     $("form#changeQuote").on('submit', function(e){
//         e.preventDefault();
//         var data = $('input[name=quote]').val();
//         $.ajax({
//             type: 'post',
//             url: '/ajax',
//             data: data,
//             dataType: 'text'
//         })
//         .done(function(data){
//             $('h1').html(data.quote);
//         });
//     });
// });

$(document).ready(function(){

	$('.ui.sidebar').sidebar({
		dimPage: false,
		transition: 'push'
	});

	$('.ui.sidebar')
		.sidebar('attach events', '.item.sidebar-toggle');

	$('.ui.dropdown')
		.dropdown();

	$('.ui.sticky')
		.sticky({
		context: '.ui.column.main-column'
	});

	$('#rangestart').calendar({
		type: 'date',
		endCalendar: $('#rangeend'),
		onChange: function (date, text, mode) {
			filterState.startdate = date;
			updateBoard();
		}
	});

	$('#rangeend').calendar({
		type: 'date',
		startCalendar: $('#rangestart'),
		onChange: function (date, text, mode) {
			filterState.enddate = date;
			updateBoard();
		}
	});

	$('#example9').calendar({
		type: 'date',
	    onChange: function (date, text, mode) {
	    	filterState.date = date;
	    	updateBoard();
    	}
	});

	$('.menu .item').click(function() {
		var setting = $(this).text().trim();
		filterState.dateSetting = setting;

		if (setting === "ALL") {
			$('#example9, #rangestart, #rangeend').css({
				"display":"none"
			});
		} else if (setting === "RANGE") {
			$('#rangestart, #rangeend').css({
				"display":"inline-block"
			});
			$('#example9').css({
				"display":"none"
			})
		} else if (setting === "FROM" || setting === "BEFORE") {
			$('#example9').css({
				"display":"inline-block"
			})
			$('#rangestart, #rangeend').css({
				"display":"none"
			});
		}

		updateBoard();
	})


	$('button.category-input-button').click(function() {
	    var state = $(this).val(); // get value of button
	    var a = state.slice(0); // copy by value
	    var index = $(this).index();

	    if (a === "1") {
	    	$(this).val("2");
		    $(this).css({
		    	'background':"#E0E1E2",
		    	'color':"black"
		    })
		    filterState.categories[index] = false;
	    } else if (a === "2") {
	    	$(this).val("1")
		    $(this).css({
		    	'background':"#FBBD08",
		    	'color':"white"
		    })
		    filterState.categories[index] = true;
	    } 

	    updateBoard();
	});

	$('#searchinputsubmit').click(function() {
		var search = $('#searchinput').val();
		filterState.search = search;

		updateBoard();
	});
});

/* CONTENT VIEW FUNCTIONALITY */

var contentViewer = document.getElementById('contentviewer');

function showContent(post) {

	// remove contentViewer elements
  	// while (contentViewer.firstChild) {
   //  	contentViewer.removeChild(contentViewer.firstChild);
  	// };

	document.getElementById('contentviewerpostheader').innerHTML = post.title;
	document.getElementById('contentviewerpostdescription').innerHTML = post.description;
	document.getElementById('contentviewerpostcontent').innerHTML = post.content;
	// .ui.header.content-viewer-post-description

}



/* BOARD FILTER FUNCTIIONALITY */

var postToViewIndex;

var filterState = {
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
};

/* Ajax request, called for each change to a filter element */
function updateBoard() {
    $.ajax({
        type: 'post',
        url: './ajax',
        data: JSON.stringify(filterState),
        contentType: 'application/json'
    })
    .then(function(data){
        $('#feedcolumn').html(data);
    });
}
