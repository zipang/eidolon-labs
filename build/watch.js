#!/usr/bin/env node

var build = require("./build"),
	path = require("path"),
	yfm = require("yaml-front-matter"),
	watch = require("node-watch"),
	sync = require("sync-files");

const settings = require("./settings.json");

// Build some absolute paths for the most important dir
var workingDir = path.join(__dirname, ".."),
	assetsDir  = path.join(workingDir, `theme/assets`),
	outputDir  = path.join(workingDir, settings.buildDir);

/**
 * WATCH CONTENT CHANGES
 */
watch(
	path.join(__dirname, "../content"),
	{
		recursive: true, // watch all sub-dirs in content/
		filter: f => /\.md$/.test(f) // watch only markdown files  && !/^__/.test(path.basename(f))
	},
	async (eventName, fileName) => {
		console.log(`${eventName} : ${fileName}`);

		if (eventName === "update") {
			let file = yfm.loadFront(fileName);
			file._path = fileName;
			console.log(JSON.stringify(file));
			try {
				await build({env: "prod"}, file);
				console.log("READY.");
			} catch(err) {
				console.error(err);
			}
		}
	}
);


/**
 * WATCH TEMPLATE CHANGES
 */
watch(
	path.join(__dirname, "../theme/templates"),
	{ recursive: true },
	async (eventName, fileName) => {

		console.log(`TEMPLATE CHANGED : ${fileName}`);
		try {
			await build({env: "dev"});
			console.log("READY.");
		} catch(err) {
			console.error(err);
		}
	}
);

/**
 * WATCH BUILD CHANGES
 */
watch(
	__dirname,
	{ recursive: true },
	async (eventName, fileName) => {

		console.log(`BUILD CHANGED : ${fileName}`);
		try {
			await build({env: "dev"});
			console.log("READY.");
		} catch(err) {
			console.error(err);
		}
	}
);


sync(
	assetsDir,
	path.join(outputDir, "assets"),
	{ watch: true },
	(event, data) => console.log(`${event}: ${JSON.stringify(data)}`)
);

sync(
	path.join(assetsDir, "config.yml"),
	path.join(outputDir, "config.yml"),
	{ watch: true },
	(event, data) => console.log(`${event}: ${JSON.stringify(data)}`)
);
