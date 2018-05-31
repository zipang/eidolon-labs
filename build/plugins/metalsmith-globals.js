var Handlebars = require("handlebars"),
	basename   = require("path").basename,
	globals = Handlebars.globals = {};

Handlebars.registerHelper("globals", function(name) {
	let block = Handlebars.globals[name] || "block not found : " + name + " inside " + Object.keys(Handlebars.globals);
	return new Handlebars.SafeString(block);
});

Handlebars.registerHelper('blockHelperMissing', function(context, options) {
	let ctx = Handlebars.globals[options.name];
	if (!ctx) {
		return "block not found : " + options.name + " inside " + Object.keys(Handlebars.globals);
	} else {
		return options.fn(ctx);
	}
});

/**
 * Get rid of the statamic numerotation inside the file's path
 * @param {String} path
 */
function unnumbered(path) {
	if (!path) return "";
	return path.split("/").map(p => p.replace(/^[0-9]+[\-\.]/, '')).join("/").toLowerCase();
}

module.exports = function plugin(options) {

	return  function(files, mrsmith, done) {

		try {

			// 1st pass : get rid of junk files and copy global files to their namespace
			Object.keys(files).forEach(function(path) {
				var file = files[path],
					slug = unnumbered(basename(path, ".md"));

				file._path = path; // preserve the original file name

				if (file.global) {
					// copy this content inside the global namespace !
					globals[slug] = file;

					console.info(`Adding ${slug} data : ${Object.keys(file)} to globals`);
					delete files[path];
					return;
				}

				// Does this file belong to a collection ?
				var collection = mrsmith.metadata()[file.collection];

				if (collection && file.parent) {
					// Tell it to the parent file
					file.parent.relatedPosts = collection;
					file.parent.collection_title = file.collection;
				}

			});

			done();
		} catch (err) {
			console.error(err);
			return;
		}
	}
}
