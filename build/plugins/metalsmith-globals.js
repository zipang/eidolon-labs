
module.exports = function plugin(options) {

	return function(files, metadata) {

		// 1st pass : get rid of junk files and copy global files to their namespace
		const [globals, others] = files.partition(file => file.global)

		globals.forEach(file => {

			// copy this content inside the global namespace !
			globals[file.slug] = file;

			console.info(`Adding ${slug} data : ${Object.keys(file)} to globals`);

			// Does this file belong to a collection ?
			var collection = metadata[file.collection];

			if (collection && file.parent) {
				// Tell it to the parent file
				file.parent.relatedPosts = collection;
				file.parent.collection_title = file.collection;
			}

		});

		// now that the global data have been separated, return the other files
		return others;

	}
}
