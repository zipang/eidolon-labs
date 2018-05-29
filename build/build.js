#!/usr/bin/env node

var fs = require("fs-extra"),
	path = require("path"),
	loadSettings = require("./Settings"),
	metalsmith = require("metalsmith"),
	filterPlugin = require("./plugins/metalsmith-filter"),
	// //debug = require('metalsmith-debug'),
	// drafts = require("metalsmith-drafts"),
	globals = require("./plugins/metalsmith-globals"),
	breadcrumbs = require("./plugins/metalsmith-breadcrumbs"),

	markdown = require("markdown-bundle/src/plugins/metalsmith-markdown"),
	toc = require("./plugins/metalsmith-toc"),
	// logger = require("./plugins/metalsmith-logger"),
	collections = require("metalsmith-collections"),
	// permalinks = require("metalsmith-permalinks"),
	layoutsExt = require("metalsmith-layouts-add-extension"),
	layouts = require("metalsmith-layouts"),
	sitemap = require("metalsmith-sitemap"),
	Handlebars = require("./Handlebars"),

	Deferred = require("./Deferred");



/**
 * Create the function passed to metalsmith.filter()
 *
 * @param {Object} params
 * @param {Object} (optional) updated file (allready parsed)
 * @returns {Function}
 */
function ignoreFilesWhen(params, updated) {

	var checkPathInside = "";

	if (updated && ((updated.collection === "fiche-de-cours")
				|| (updated._fieldset === "sommaire-fiche-de-cours"))) {
		// Keep only files inside the same level (content/fiches-de-cours/level/page)
		checkPathInside = updated._path.substring(0, updated._path.lastIndexOf("/"));

		console.log(`Keeping only files inside : ${checkPathInside}`);
	}

	return function(fullPath, stats) {

		// explore all sub-directories
		if (stats.isDirectory()) {
			return false;
		}

		// Ignore all non markdown files (this includes garbage OS files !)
		if (!/.md$/.test(path.basename(fullPath))) {
			return true;
		}

		if (updated) { // build only updated file and its dependancies

			if (checkPathInside) {
				return (fullPath.indexOf(checkPathInside) === -1);

			} else if (updated.global) {
				return false; // every file could have been impacted by a modification on a global

			} else {
				// ignore every other files
				return (fullPath !== updated._path);
			}
		}
	}
}

/**
 * Launch the static build with Metalsmith
 * @param {Object} params
 * @param {Object} (optional) updated File
 */
async function build(params, updated) {

	// read settings.json while applying specific environment overriding
	const settings = loadSettings(params);

	// Build some absolute paths for the most important dir
	var workingDir = path.join(__dirname, ".."),
		assetsDir  = path.join(workingDir, `theme/assets`),
		outputDir  = path.join(workingDir, settings.buildDir);

	console.log("STARTING BUILD");
	var mrsmith = metalsmith(workingDir)
		.source("./content")
		.destination(outputDir); // starts where the build script is

	let buildPromise = new Deferred();

	mrsmith
		.metadata({
			site: settings.site
		})
		.clean(false)
		.ignore(ignoreFilesWhen(params, updated))
		.use(filterPlugin({ // Some filters can only be applied to parsed files
			ignore: file => file.ignore, // allow us to skip file that are marked to be ignored
		}))
		.use(breadcrumbs({
			autocollection: true
		}))
		.use(collections())
		.use(globals())
		.use(markdown({
			keys: ["main_title", "paragraph", "column_header", "column_one", "column_two", "column_three"]
		}))
		.use(toc())
		.use(layoutsExt({
			layout_extension: ".hbs" // use Handlebars by defaults
		}))
		.use(layouts({
			engine: "handlebars",
			directory: `theme/templates`,
			partials: `theme/templates/partials`
		}))
		.use(sitemap({
			hostname: settings.site.baseUrl,
			omitIndex: true
		}))
		// .use(concat({ // concat all JS and CSS files
		// 	files: [
		// 		'*.js',
		// 	],
		// 	searchPaths: [
		// 		`design/assets/js`,
		// 		`themes/${settings.theme}/assets/js`
		// 	],
		// 	output: `${settings.buildDir}/assets/js/bundle.js`,
		// 	forceOutput: true
		// }))
		.build(onBuildEnd);

	async function onBuildEnd(err) {
		if (err) {
			buildPromise.reject(err);
		} else {
			buildPromise.resolve("BUILD SUCCESS");
		}
	}

	return buildPromise.promise;
}

module.exports = build;

build._DEFAULTS = {
	env: "prod"
}

async function runCmdLine() {

	// Parse the command line arguments
	const params = require("yargs")
		.usage("./build.js --env [dev|preprod|prod]")
		.default("env", "prod")
		.describe("env", "Target environement ([dev|beta|prod])")
		.boolean("refresh-assets")
		.default("refresh-assets", false)
		.describe("refresh-assets", "Copier les assets")
		.showHelpOnFail(true)
		.help(
			'help',
			'Arguments listing.'
		)
		.argv;

	try {
		console.log(await build(params));
		process.exit(0);
	} catch(err) {
		console.error(err);
		process.exit(1);
	}

}

// we have been called by the command line
if (!module.parent) runCmdLine();

