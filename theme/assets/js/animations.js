$(function onPageLoad() {
	var w = window, $w = $(w);

	// HEADER ANIMATION (TOGGLE COLLAPSED CLASS WHEN SCROLLING)
	var $mainHeader = $("#main-header");

	function fixHeader() {
		var offset = w.pageYOffset || document.documentElement.scrollTop,
			shrinkOn = 150;
		$mainHeader.toggleClass("collapsed", offset > shrinkOn);
	}
	$w.on("scroll", $.throttle(fixHeader));

	AOS.init({ disable: "mobile" });

	if(!("requestAnimationFrame" in w)) return;
	if(/Mobile|Android/.test(navigator.userAgent)) return;


	/**
	 * Move the background image position around to achieve the parallax effect
	 * @return {Function}
	 */
	function animateBgPosition($bgContainer) {
		var bgContainer = $bgContainer[0],
			scheduled; // scheduled update

		function updateBgPosition() {
			var wH = $w.height(),
				rect = bgContainer.getBoundingClientRect(),
				parallaxCoef = (rect.top) / wH;

			if (rect.top < wH && (rect.top + rect.height) > 0) {
				bgContainer.style.backgroundPositionY = Math.floor(50 - 50*parallaxCoef) + '%';
			} else {
				bgContainer.style.backgroundPositionY = '50%';
			}
		}

		return function onScroll(evt) {
			if (scheduled) cancelAnimationFrame(scheduled);
			scheduled = requestAnimationFrame(updateBgPosition);
		}
	}

	$(".parallax-bg").inView(function (visible) {
		var $elt = this;
		if (visible) {
			$elt._hnd = $w.on("resize scroll", animateBgPosition($elt));
		} else {
			$w.off("resize scroll", $elt._hnd);
		}
	});

	var $progressionBar = $("#progression-bar");

	/**
	 * Move the progression bar indicating the % of the article content that has been viewed
	 * @return {Function}
	 */
	function animateProgression($articleContent) {
		var articleContent = $articleContent[0],
			scheduled; // scheduled update

		function updateProgression() {
			var wH = w.innerHeight,
				cH = $articleContent.height(),
				rect = articleContent.getBoundingClientRect(),
				coefProgression = 0;

			if (rect.bottom < cH) {
				coefProgression = 100; // END OF THE ARTICLE HAS BEEN SEEN
			} else if (rect.top < wH) {
				coefProgression = 100 * (cH - rect.bottom + wH) / cH;
			}

			$progressionBar.width(`${coefProgression}%`).toggleClass("hidden", coefProgression === 0);
		}

		return function onScroll(evt) {
			if (scheduled) cancelAnimationFrame(scheduled);
			scheduled = requestAnimationFrame(updateProgression);
		}
	}

	$(".main-content").inView(function(visible) {
		var $elt = this;
		if (visible) {
			$elt._hnd = $w.on("resize scroll", animateProgression($elt));
		} else {
			$w.off("resize scroll", $elt._hnd);
		}
	});

});
