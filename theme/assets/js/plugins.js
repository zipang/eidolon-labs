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
	 * Scroll to target element position (speed : 1000px/s or ms)
	 * @param {DOMElement} target element to scroll to
	 * @param {Number} ms number of millisecond to reach the target
	 * @param {Number} offset number of pixels from top of screen to position the scrolled element
	 */
	$.scrollTo = function(target, ms, offset) {
		var $target  = $(target),
			distance = $target.offset().top - $w.scrollTop(),
			offset   = offset || -w.innerHeight/4; // default offset : position element at 1/4 from viewport top

		$target.velocity("scroll", {
			duration: ms || distance,
			ease: "ease-in-out",
			offset: offset
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

})(window, jQuery); // redefine window, jQuery and undefined as local variables
