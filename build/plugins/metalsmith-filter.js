
/**
 * Filter the files
 *
 * @param {Object|Function|Array} Plugins options : filters to apply
 * @return {Function} Filter the files with the provided filters
 */
function plugin(options) {
	var filters = options || [];

	if (typeof filters === "function") { // that's the filter function
		filters = [filters];
	}
	if (typeof filters === "object") { // that's an object containing every filter functions
		filters = Object.keys(filters).map(key => filters[key]);
	}

	/**
	 * Take a Metalsmith file representation and apply every filters
	 * @param {Object} f
	 * @return {Boolean} TRUE if the file has been positive with a filter
	 */
	function filterAtOnce(f) {
		return filters.find(filter => filter(f));
	}

	return async function(files, mrsmith, done) {

		try {
			Object.keys(files).forEach(function(path) {
				let filter, file = files[path];
				file._path = path;
				if (filter = filterAtOnce(file)) {
					console.log(`Metalsmith-filters : Removed ${path} (${filter.name})`);
					delete files[path];
				} else {
					console.log(`Metalsmith-filters : Keeping ${path} for process..`);;
				}
			});

		} catch(err) {
			console.error(err);
		}

		done();
	}
}
/**
 * Expose `plugin`.
 */
module.exports = plugin;
