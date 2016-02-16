$(function() {

	// Get the form.
	var form = $('#formTemp');
	var form2 = $('#formRele');
	var form3 = $('#formLed');

	// Get the messages div.
	var formMessages = $('#form-messages');
	var formMessages2 = $('#form-messages2');
	var formMessages3 = $('#form-messages3');
	
	// Set up an event listener for the contact form.
	$(form).submit(function(e) {
		// Stop the browser from submitting the form.
		e.preventDefault();

		// Serialize the form data.
		var formData = $(form).serialize();

		// Submit the form using AJAX.
		$.ajax({
			type: 'POST',
			url: $(form).attr('action'),
			data: formData
		})
		.done(function(response) {
			// Make sure that the formMessages div has the 'success' class.
			$(formMessages).removeClass('error');
			$(formMessages).addClass('success');

			// Set the message text.
			$(formMessages).text(response);

			// Clear the form.
			$('#name').val('');
			$('#email').val('');
			$('#message').val('');
		})
		.fail(function(	) {
			// Make sure that the formMessages div has the 'error' class.
			$(formMessages).removeClass('success');
			$(formMessages).addClass('error');

			// Set the message text.
			if (data.responseText !== '') {
				$(formMessages).text(data.responseText);
			} else {
				$(formMessages).text('Oops! An error occured and your message could not be sent.');
			}
		});
	});
	
	$(form2).submit(function(e) {
		e.preventDefault();
		var formData = $(form2).serialize();
		// Submit the form using AJAX.
		$.ajax({
			type: 'POST',
			url: $(form2).attr('action'),
			data: formData
		})
		.done(function(response) {
			// Make sure that the formMessages div has the 'success' class.
			$(formMessages2).removeClass('error');
			$(formMessages2).addClass('success');

			// Set the message text.
			$(formMessages2).text(response);
		})
	});	
	
	$(form3).submit(function(e) {
		e.preventDefault();
		var formData = $(form3).serialize();
		// Submit the form using AJAX.
		$.ajax({
			type: 'POST',
			url: $(form3).attr('action'),
			data: formData
		})
		.done(function(response) {
			// Make sure that the formMessages div has the 'success' class.
			$(formMessages3).removeClass('error');
			$(formMessages3).addClass('success');

			// Set the message text.
			$(formMessages3).text(response);
		})
	});
});
