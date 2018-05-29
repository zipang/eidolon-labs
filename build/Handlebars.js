const Handlebars = require("handlebars"),
	H            = require("just-handlebars-helpers"),
	fontawesome  = require('@fortawesome/fontawesome'),
	solid        = require('@fortawesome/fontawesome-free-solid').default,
	moment       = require("moment");

// Adds all the icons from the Solid style into our library for easy lookup
fontawesome.library.add(solid)

Handlebars.registerHelper('fontawesome-css', function () {
	return new Handlebars.SafeString(
		fontawesome.dom.css()
	)
})

var notFound = fontawesome.icon({ prefix: 'fas', iconName: "question" });

Handlebars.registerHelper('fontawesome-icon', function (iconName) {
	var icon = fontawesome.icon({ prefix: 'fas', iconName: iconName });
	return new Handlebars.SafeString(
		icon ? icon.html : notFound.html
	)
})

// Register some Handlebar helpers
H.registerHelpers(Handlebars);

Handlebars.registerHelper("date", function (date) {
	return moment(date, "YYYY-MM-DD").format("D MMM YYYY");
});

Handlebars.registerHelper("filename", function (path) {
	return path.split("/").pop();
});

Handlebars.registerHelper("link", function(url) {
	return new Handlebars.SafeString(
		Handlebars.Utils.escapeExpression(url || '')
	);
});

Handlebars.registerHelper("debug", function(what, options) {
	return (typeof what === "string") ? what + " > " + JSON.stringify(this[what]) : JSON.stringify(this) + " in context " + JSON.stringify(options);
});


/**
 * Render a button link
 *   {{ button action='look at me : http://hereiam.me' }}
 * @param {String} action 'text : link'
 * @param {String} action_type [info|success|warning|danger]
 * @param {String} action_icon icon class name
 */
Handlebars.registerHelper("button", function(action, action_type, action_icon) {

	if (!action) return "";

	var parts = action.split(" : "),
		action_text = parts[0].trim(),
		action_link = new Handlebars.SafeString(
			Handlebars.Utils.escapeExpression(parts[1] || '')
		);

	// Lazily load the partial
	var partial = Handlebars.partials["button"];
	if (typeof partial !== 'function') {
		partial = Handlebars.compile(partial);
	}

	return partial({
		action_text: action_text,
		action_link: action_link,
		action_type: action_type || '',
		action_icon: action_icon || '',
		is_external: true
	});
});

/**
 * Render any section with its dedicated partial
 *   {{#sections}}{{/sections}}
 * @param {String} name 'Name of the section partial'
 */
Handlebars.registerHelper("sections", function(name) {

	var output = "", parentContext = this; // We can't access parent conetxt inside partials !!!

	this.sections.forEach(function(section) {
		// Lazily load the partial
		var partial = Handlebars.partials[section.type];
		if (typeof partial !== 'function') {
			partial = Handlebars.compile(partial);
		}

		output += partial(Object.assign({
			parent: parentContext
		}, section));
	});

	return output;
});

module.exports = Handlebars;
