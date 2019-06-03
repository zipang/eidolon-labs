#!/usr/bin/env node

var fs = require("fs-extra"),
	path = require("path"),
	loadSettings = require("./Settings"),
	vavawoo = require("vavawoo"),
	markdown = require("markdown-bundle/src/plugins/vavawoo-markdown"),
	toc = require("./plugins/vavawoo-toc"),
	collections = require("./plugins/vavawoo-collections");
	// permalinks = require("vavawoo-permalinks")
	// sitemap = require("vavawoo-sitemap")




/**
 * Launch the build with Vavawoo
 * @param {Object} params
 * @param @optional {Object} updated File
 */
async function build(params, updated) {

	// read settings.json while applying specific environment overriding
	const settings = loadSettings(params);

	// Build some absolute paths for the most important dir
	var workingDir = path.join(__dirname, ".."),
		assetsDir  = path.join(workingDir, `theme/assets`),
		outputDir  = path.join(workingDir, settings.buildDir);

	console.log("STARTING BUILD");
	var build = vavawoo({
		title: settings.site,
		source: "./content",
		destination: outputDir
	})
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
	.use(toc());

	return build.run(); // that's a promise
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

