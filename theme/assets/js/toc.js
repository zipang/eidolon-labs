$(function() {

	var $navigation = $("#navigation"), $toc = $("#toc");

	// Smooth scroll to local links from the TOC
	$toc.on("click", "a", function(evt) {
		var $a = $(this), href = $a.attr("href") || "";
		if (href.startsWith("#")) { // local link
			evt.preventDefault();
			$.scrollTo($(href));
			document.location.hash = href.substr(1);
		}
	});

	// Show current chapter in the TOC
	function showInToc(visible) {
		if (visible) {
			var $heading = this,	// yep, we are in view
				$tocLink = $("#toc-" + $heading.attr("id"));
			$toc.find("li").removeClass("active");
			$tocLink.parents("li").addClass("active");
		}
	}
	$("h2, h3, h4").inView(showInToc);

	// Hide TOC when sommaire section is visible
	function hideToc(visible) {
		$navigation.velocity({opacity: visible?0:1});
	}
	$("#sommaire").inView(hideToc);
});
