"use strict";

var gutil = require('gulp-util');
var jade = require('jade');
var marked = require('marked');
var through = require('through2');
var _ = require('lodash');

function GulpMarkedJade(layout, locals){

	layout = layout || "./src/jade/layout.jade";
	locals = locals || {};

	return through.obj(function(file, enc, cb) {
		if (file.isNull()) {
			// return empty file
			return cb(null, file);
		}

		marked(file.contents.toString(), null, function(err, data){

			var options = _.cloneDeep(locals);
			options.content = data;
			options.pretty = true;

			var html = jade.renderFile(layout, options)

			file.contents = new Buffer(html);
			file.path = gutil.replaceExtension(file.path, '.html');
			cb(null, file);
		});
	});

}

module.exports = GulpMarkedJade;