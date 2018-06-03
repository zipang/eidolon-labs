const Handlebars = require("handlebars"),
	H            = require("just-handlebars-helpers"),
	fontawesome  = require('@fortawesome/fontawesome'),
	solid        = require('@fortawesome/fontawesome-free-solid').default;

// Register a whole set of helpful Handlebar helpers
H.registerHelpers(Handlebars);

// Add all fontawesome solid style icons into our library for easy lookup
fontawesome.library.add(solid);

var notFound = fontawesome.icon({ prefix: 'fas', iconName: "question" });

/**
 * Render a fontawesome icon as inline SVG !
 * @see https://fontawesome.com/how-to-use/server-side-rendering
 */
Handlebars.registerHelper('fontawesome-icon', function (iconName) {
	var icon = fontawesome.icon({ prefix: 'fas', iconName: iconName });
	return new Handlebars.SafeString(
		icon ? icon.html : notFound.html
	)
})



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
 * Render a quote block
 *   {{ blockquote 'Let it be ! - John Lennon' }}
 * @param {String} fullQuote 'quote - author'
 */
Handlebars.registerHelper("blockquote", function(fullQuote) {

	if (!fullQuote) return "";

	var parts = fullQuote.split("-"),
		quote = parts[0].trim(),
		author = parts[1] ? parts[1].trim() : "";

	// Lazily load the partial
	var partial = Handlebars.partials["blockquote"];
	if (typeof partial !== 'function') {
		partial = Handlebars.compile(partial);
	}

	return new Handlebars.SafeString(partial({
		quote: quote,
		author: author
	}));
});


/**
 * Render the unplash photographer's credit link
 *   {{ unsplash_credits photographer }}
 * @param {String} photographer 'John Doe (@unsplash_id)'
 */
Handlebars.registerHelper("unsplash_credits", function(photographer_credits) {

	if (!photographer_credits) {
		console.log("No photographer credits found")
		return "";
	}

	var name = photographer_credits.split("(")[0].trim(),
		unsplash_id = /(@\w+)/g.test(photographer_credits)
			? /(@\w+)/g.exec(photographer_credits)[0]
			: "";

	// Lazily load the partial
	var partial = Handlebars.partials["unsplash_badge"];
	if (typeof partial !== 'function') {
		partial = Handlebars.compile(partial);
	}

	return partial({
		photographer: name,
		unsplash_id: unsplash_id
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

		// Load the partial associated with this section
		var partial = Handlebars.partials[section.type];

		if (!partial) {
			console.warn("No template found for section " + section.type);
			return;
		}

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
