
$('#contact-form').bootstrapValidator({
	// To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
	feedbackIcons: {
		valid: 'fa fa-check',
		invalid: 'fa fa-remove',
		validating: 'fa fa-refresh'
	},
	fields: {
		name: {
			validators: {
				notEmpty: {
					message: 'Indiquez votre nom'
				}
			}
		},

		email: {
			validators: {
				notEmpty: {
					message: 'Saisissez une adresse mail'
				},
				emailAddress: {
					message: 'Vérifiez votre adresse mail'
				}
			}
		},

		message: {
			validators: {
				notEmpty: {
					message: 'Veuillez saisir un message'
				}
			}
		}
	}})
	.on('success.form.bv', function(evt) {
		$('#success-message').slideDown({ opacity: "show" }, "slow") // Do something ...
		$('#contact-form').data('bootstrapValidator').resetForm();

		// Prevent form submission
		evt.preventDefault();

		// Get the form instance
		var $form = $(evt.target);

		// Get the BootstrapValidator instance
		var bv = $form.data('bootstrapValidator');

		// Use Ajax to submit form data
		$.post($form.attr('action'), $form.serialize(), function(result) {
			console.log(result);
		}, 'json');
	});
