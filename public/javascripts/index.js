
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
	  .dropdown()
	;

	$('.ui.sticky')
	  .sticky({
	    context: '.ui.column.main-column'
	  })
	;
});

/* BOARD FILTER FUNCTIIONALITY */

var filterState = {
	categories: [ 
		true, 
		true, 
		true 
	],
	updateCategory: function(state, index) {
		this.categories[index] = state;
		return;
	}
};


function toggleCategoryButton(element) {
	// Store a boolean in 'state', and an index in 'index' to pass to filterState method to update object AND
	// Get value of invisible input associated with category button, then toggle it either to true or false
	var state = (element.firstElementChild.value === "true") ? false : true;
	var index = getIndexOfElement(element);
	element.firstElementChild.value = (element.firstElementChild.value === "true") ? "false" : "true";

	filterState.updateCategory(state, index);

	// update button styles 
	toggleCategoryButtonStyle(element, state);

	// AJAX request
	updateBoard();
}

function toggleCategoryButtonStyle(element, isSelected) {
	// toggles button between true and false styles
	if (isSelected) {
		element.style.background = "#FBBD08";
		element.style.color = "white";
	} else {
		element.style.background = "#E0E1E2";
		element.style.color = "black";
	}
}

function getIndexOfElement(node) { 
	var i = 0;
	for (i=0; (node=node.previousSibling); i++);
	return i;
}



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