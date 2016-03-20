#!/usr/bin/env node

/**
 * To run, `node smap <path/to/js/file>:<line>:<col> [path to source directory, default is ../../]`
 **/
var fs = require("fs");
var source = process.argv[2].split(":");
var file = source[0];
var line = parseInt(source[1]);
var col = parseInt(source[2]);
var sourceDirectory = process.argv[3] || "../../";

// make sure a string is always the same length
function pad(str, len) {
	str = str + "";
	while(str.length < len) {
		str = str + " ";
	}
	return str;
}

var sourceMap = require('source-map');
fs.readFile(file + ".map", 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
	var obj = JSON.parse(data);
	var smc = new sourceMap.SourceMapConsumer(obj);
	var originalPosition = smc.originalPositionFor({
		line: line,
		column: col
	});

	console.log("Original Position: " + originalPosition.source + ", Line " + originalPosition.line + ":" + originalPosition.column);

	// remove the webpack stuff and try to find the real file
	var originalFileName = (sourceDirectory +  originalPosition.source).replace("webpack:///", "").replace("/~/", "/node_modules/").replace(/\?[0-9a-zA-Z\*]+$/, "");
	fs.access(originalFileName, fs.R_OK, function(err){
		if(err) {
			console.log("Unable to access source file, " + originalFileName);
		} else {
			fs.readFile(originalFileName, function (err, data) {
				if (err) throw err;

				// Data is a buffer that we need to convert to a string
				// Improvement: loop over the buffer and stop when the line is reached
				var lines = data.toString('utf-8').split("\n");
				var line = originalPosition.line;
				if(line > lines.length){
					console.log("Line " + line + " outside of file bounds (" + lines.length + " lines total).");
				} else {
					var minLine = Math.max(0, line-6);
					var maxLine = Math.min(lines.length, line+5);
					var code = lines.slice(minLine, maxLine);
					console.log("Code Section: ");
					var padLength = Math.max(("" + minLine).length, ("" + maxLine).length) + 1;
					var currentLine = minLine;
					for(var i = 0 ; i < code.length ; i++) {
						console.log(pad(++currentLine, padLength) + "| " + code[i]);
					}
				}
			});
		}
	});
});
