var AR = Array.prototype;

if (!AR.last) AR.last = function() {
	return this[this.length-1];
}

function notEmpty(str) {
	return (str && str.length);
}

/**
 * Vavawoo plugin that adds `parents` and `parent` property to each files,
 * to easily generate hierarchical navigation links (breadcrumbs..)
 *
 * @return {Function}
 */
function plugin(opts) {

	return function(files, mrsmith, done) {

		var baseUrl = mrsmith.metadata().site.baseUrl,
			paths = {};

		// First loop to determine absolute paths of files
		files.map(file => {
			// clean path from extension and add leading '/'
			var absolutePath = "/" + key.replace(/\.[0-9a-z]+$/i, '').replace("/index", '');

			file.path = absolutePath;
			file.url = baseUrl + absolutePath;
			paths[absolutePath] = file;
		});

		console.log("All files : " + JSON.stringify(Object.keys(paths)));

		// Second loop to determine parents
		Object.keys(paths).forEach(function(path) {
			var parts = path.split("/").filter(notEmpty),
				file = paths[path],
				parentPath,
				parents = [];

			if (parts.length === 1) return; // no parents to look for

			// remove the filename from the list
			var fileName = parts.pop();

			if (opts.autocollection) {
				// the parent post is the name of a new collection
				if (parts.last()) {
					console.log(`File ${fileName} belongs to the ${parts.last()} collection`);
					file.collection = parts.last();
				}
			}

			do {
				parentPath = "/" + parts.join("/");
				parents.push(paths[parentPath]);

			} while (parts.pop());

			file.parents = parents.reverse();
			file.parent  = parents.last();

			if (file.parent) {
				console.log(file.path + " has parent " + file.parent.path);
			}
		});

		done();
	};
}

/**
 * Expose `plugin`.
 */
module.exports = plugin;
