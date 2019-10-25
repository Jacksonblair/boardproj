
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
			filterState.startdate = JSON.stringify(date).substr(1, 10);;
			updateBoard();
		}
	});

	$('#rangeend').calendar({
		type: 'date',
		today: true,
		startCalendar: $('#rangestart'),
		onChange: function (date, text, mode) {
			filterState.enddate = JSON.stringify(date).substr(1, 10);;
			updateBoard();
		}
	});

	$('#calendar').calendar({
		type: 'date',
		initialDate: null,
		today: true,
	    onChange: function (date, text, mode) {
	    	filterState.date = JSON.stringify(date).substr(1, 10);
	    	updateBoard();
    	}
	});

	$('.menu .item').click(function() {
		var setting = $(this).text().trim();

		filterState.dateSetting = setting;

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

		updateBoard();

	})


	$('button.category-input-button').click(function() {
	    var state = $(this).val(); // get value of button
	    var a = state.slice(0); // copy by value
	    var index = $(this).index();

	    if (a === "1") {
	    	$(this).val("2");
		    $(this).css({
		    	'color':"#e6e6e6",
		    	'background':"white"
		    })
		    filterState.categories[index] = false;
	    } else if (a === "2") {
	    	$(this).val("1")
		    $(this).css({
		    	'color':"black",
		    	'background':'#E0E1E2'
		    })
		    filterState.categories[index] = true;
	    } 

	    updateBoard();
	});

	$('#searchform').submit(function(e) {
		e.preventDefault();
		var search = $('#searchinput').val();
		filterState.search = search.toLowerCase();
		updateBoard();
	})

});

function searchformsubmit() {
	console.log('wot');
	var search = $('#searchinput').val();
	filterState.search = search.toLowerCase();
	updateBoard();
}

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

	console.log('updating filters...')

    $.ajax({
        type: 'post',
        url: './ajax',
        data: JSON.stringify(filterState),
        contentType: 'application/json'
    })
    .then(function(data){
    	if (data) {
        	$('#feedcolumn').html(data);
        	// console.log(data);
    	} else {
			console.log('wot');  		
    	}
    });
}
