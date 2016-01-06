$('#tag').on('change', function() {
 // alert( this.name ); // or $(this).val()

	window.location =  $(this).find(':selected').text();
});