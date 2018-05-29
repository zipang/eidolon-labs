// Place any jQuery/helper plugins in here.
(function (w, $, undefined) {
"use strict";

	var $w = $(w); // we'll use it often

	$.noop = function () {};

	// Avoid `console` errors in browsers that lack a console.
	if (!w.console) (function () {
		var console = (w.console = {}),
			methodsToAdd = [ 'debug', 'dir', 'error', 'info', 'log', 'warn' ];

		while (methodsToAdd.length) {
			console[methodsToAdd.pop()] = $.noop;
		}
	}());

	/**
	 * Wait that functions calls run below @delay ms to trigger the function
	 */
	$.debounce = function (fn, delay, context) {
		delay = delay || 250;
		return function () {
			var ctx = context || w, args = arguments;
			clearTimeout(fn.hnd);
			fn.hnd = setTimeout(function () {
				fn.apply(ctx, args);
			}, delay);
		};
	};
	/**
	 * Regulate functions calls to be triggered every @threshhold ms when under stress
	 */
	$.throttle = function (fn, threshhold, context) {
		threshhold = threshhold || 250;
		var last, deferTimer;
		return function () {
			var ctx = context || w, args = arguments, now = +new Date;
			if (last && now < last + threshhold) {
				// hold on to it
				clearTimeout(deferTimer);
				deferTimer = setTimeout(function () {
					last = now;
					fn.apply(ctx, args);
				}, threshhold);
			} else {
				last = now;
				fn.apply(ctx, args);
			}
		};
	};

	/**
	 * Scroll to $target position (speed : 1000px/s or ms)
	 */
	$.scrollTo = function($target, ms) {
		var dest   = $target.offset(),
			offset = Number($target.data("scrollOffset")) || -w.innerHeight/4;

		if (dest) $target.velocity({
			scrollTop: offset
		}, {
			duration: ms || 500,
			ease: "ease-in-out"
		});
	}

	/**
	 * Check that an element is vertically in the targeted viewport
	 * @param {Number} padding number of px to pad the viewport
	 */
	$.fn.inViewport = function(padding) {
		var elt = $(this)[0],
			padding = padding || 0,
			rect = elt.getBoundingClientRect();

		return (rect.top < w.innerHeight - padding && rect.bottom > padding);
	};

	/**
	 * jQuery inView - Execute a callback when an element goes into view or disappear
	 * @author zipang - EIDOLON LABS
	 * Usage Example :
		$(".fireworks").inView(function(visible) {
			alert(visible ? "Oh My!" : "So sad..");
		});
	*/
	var watchList = [], pollActive = false;

	function _checkInView(padding) {

		var padding = typeof padding === "number" ? padding : w.innerHeight / 4; // apply a default padding of 1/4 of the whole viewport height

		return function() {
			watchList.forEach(function(e) {
				var $elt = e.$elt;

				if ($elt.inViewport(padding)) {
					if (!e.inview) {
						e.callback.call($elt, e.inview = true);
					}
				} else {
					if (e.inview) {
						e.callback.call($elt, e.inview = false);
					}
				}
			});
		}
	}

	$.fn.inView = function(callback, padding) {
		var $elts = $(this);

		$elts.each(function(i, elt) {
			watchList.push({
				"$elt": $(elt),
				callback: callback,
				inview: false
			});
		});

		// first call for newcomers
		var checkInView = _checkInView(padding);
		checkInView();

		if (!pollActive && watchList.length) {
			$w.on("scroll", $.throttle(checkInView, 100));
			pollActive = true;
		}

		return $elts;
	}


	// $('#contact-form').bootstrapValidator({
	// 	// To use feedback icons, ensure that you use Bootstrap v3.1.0 or later
	// 	feedbackIcons: {
	// 		valid: 'fa fa-check',
	// 		invalid: 'fa fa-remove',
	// 		validating: 'fa fa-refresh'
	// 	},
	// 	fields: {
	// 		name: {
	// 			validators: {
	// 				notEmpty: {
	// 					message: 'Indiquez votre nom'
	// 				}
	// 			}
	// 		},

	// 		email: {
	// 			validators: {
	// 				notEmpty: {
	// 					message: 'Saisissez une adresse mail'
	// 				},
	// 				emailAddress: {
	// 					message: 'Vérifiez votre adresse mail'
	// 				}
	// 			}
	// 		},

	// 		message: {
	// 			validators: {
	// 				notEmpty: {
	// 					message: 'Veuillez saisir un message'
	// 				}
	// 			}
	// 		}
	// 	}})
	// 	.on('success.form.bv', function(evt) {
	// 		$('#success-message').slideDown({ opacity: "show" }, "slow") // Do something ...
	// 		$('#contact-form').data('bootstrapValidator').resetForm();

	// 		// Prevent form submission
	// 		evt.preventDefault();

	// 		// Get the form instance
	// 		var $form = $(evt.target);

	// 		// Get the BootstrapValidator instance
	// 		var bv = $form.data('bootstrapValidator');

	// 		// Use Ajax to submit form data
	// 		$.post($form.attr('action'), $form.serialize(), function(result) {
	// 			console.log(result);
	// 		}, 'json');
	// 	});


	// // GA
	// w.dataLayer = w.dataLayer || [];
	// function gtag(){dataLayer.push(arguments);}
	// gtag('js', new Date());
	// gtag('config', 'UA-722815-1');

})(window, jQuery); // redefine window, jQuery and undefined as local variables
