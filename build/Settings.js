const fs = require("fs-extra"),
	path = require("path");

/**
 * Load environnement settings from local JSON file
 * @param {Object} params
 */
module.exports = function loadSettings(params) {

	// Load configuration from settings.json
	const settings = JSON.parse(
		fs.readFileSync(path.join(__dirname, "settings.json"))
	);

	// Overwrite default settings with environment specifics
	var envSpecifics = settings.env[params.env] || {};
	Object.keys(envSpecifics).forEach(function(key) {
		Object.assign(settings[key], envSpecifics[key]);
	});
	delete settings.env;
	console.log("settings => " + JSON.stringify(settings));

	return settings
}
