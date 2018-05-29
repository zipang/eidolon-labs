
var async = require('async');
var cheerio = require('cheerio');

var romanHeadings = ["I. ","II. ","III. ","IV. ","V. ","VI. ","VII. ","VIII. ","IX. ","X. "];

if (!Array.prototype.last) {
	Array.prototype.last = function() {
		if (this.length) {
			return this[this.length-1];
		}
	}
}

function TocItem() {
	TocItem.prototype.init.apply(this, arguments);
};

TocItem.prototype = {
	/**
	 * @param {Object} [params]
	 * @param {String} [params.id]
	 * @param {String} [params.text]
	 */
	init: function(params) {
		params = params || {};
		this.id = params.id || '';
		this.text = params.text || '';
		this.children = [];
		this.parent = null;
	},
	/**
	 * @param {TocItem} tocItem
	 */
	add: function(tocItem) {
		if (tocItem.parent) {
			throw 'tocItem.parent exists';
		}
		tocItem.parent = this;
		this.children.push(tocItem);
	},

	toJSON: function() {
		return {
			id: this.id,
			text: this.text,
			children: this.children
		};
	}
};

/**
 * @param {Object} options
 */
module.exports = function tocPlugin(options) {

	options = options || {};
	options.selector = options.selector || 'h2, h3, h4, h5, h6';
	options.headingIdPrefix = options.headingIdPrefix || '';

	function getRootLevel(headings) {
		return headings.map(function(heading) {
			return heading.level;
		}).sort()[0] - 1;
	}

	/**
	 * Build the table of content based on the list of heading elements to include
	 * @param {Array} headings
	 */
	function buildTocItems(headings) {
		if (headings.length === 0) {
			return [];
		}

		var root = new TocItem();
		var toc = root;

		var lastLevel = getRootLevel(headings);

		headings.forEach(function(heading) {
			var id    = heading.id;
			var text  = heading.text;
			var level = heading.level;

			while (level != 1 + lastLevel) {
				if (level < 1 + lastLevel) {
					toc = toc.parent;
					lastLevel--;
				} else if (level > 1 + lastLevel) {
					var emptyToc = new TocItem();
					toc.add(emptyToc);
					toc = emptyToc;
					lastLevel++;
				}
			}

			var newToc = new TocItem({
				text: text,
				id: id
			});

			toc.add(newToc);
			toc = newToc;
			lastLevel = level;
		});

		return root.children;
	}

	/**
	 * toc plugin
	 */
	return function(files, metalsmith, done) {
		var fileList = Object.keys(files).map(function(path) {
			return files[path];
		});

		async.each(fileList, function(file, done) {

			if (!file.autotoc) {
				done();

			} else {
				var $ = cheerio.load(file.contents, { decodeEntities: false });
				var headings = [], headingsCount = 0,
					headingSelector = file.autotocSelector || options.selector;

				$(headingSelector).each(function(i, h) {
					var $h = $(h),
						headingLevel = parseInt($h.prop("tagName").match(/^h([123456])$/i)[1], 10),
						headingId = "section-" + (i+1);

					$h.attr('id', headingId);
					headings.push({
						id: headingId,
						text: $h.text(),
						level: headingLevel
					});

					if (headingLevel === 2) headingsCount++;
				});

				file.toc = buildTocItems(headings);
				file.contents = new Buffer($("body").html());
				done();
			}
		}, function() {
			done();
		});
	};
};
