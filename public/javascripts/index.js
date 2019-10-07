
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

	// change invisible input value
	var state;
	// console.log("initial: ", element.firstElementChild.value);

	var state = (element.firstElementChild.value === "true") ? false : true;
	element.firstElementChild.value = (element.firstElementChild.value === "true") ? "false" : "true";

	// console.log("post: ", element.firstElementChild.value);
	// console.log("change object index state to: ", state);

	// get index of element (to match to object to send with AJAX)
	filterState.updateCategory(state, getIndexOfElement(element));

	updateBoard();
}


function getIndexOfElement(node) { 
	var i = 0;
	for (i=0; (node=node.previousSibling); i++);
	return i;
}

function updateBoard() {
    $.ajax({
        type: 'post',
        url: './ajax',
        data: JSON.stringify(filterState),
        contentType: 'application/json'
    })
    .done(function(data){
    	console.log("sent");
        // $('h1').html(data.quote);
    });
}