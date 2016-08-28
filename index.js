#!/usr/bin/env node

require('colors');

/**
 * To run, `node smap <path/to/js/file>:<line>:<col> [path to source directory, default is ../../]`
 **/

function showHelp() {
	console.log("");
	console.log("Usage: \n\tsourcemap-lookup <path/to/map/file>:<line number>:<column number> [options]");

	console.log("");
	console.log("Path to map file may include the .map or it will be assumed and added automatically.");
	console.log("");
	console.log("valid [options]:");
	console.log("\t-h, --help\t\tShow this help message.");
	console.log("\t-v, --version\t\tShow current version.");
	console.log("\t-A\t\t The number of lines to print after the target line. Default is 5.");
	console.log("\t-B\t\t The number of lines to print before the target line. Default is 5.");
	console.log("\t-C\t\t The number of lines to print before and after the target line. If supplied, -A and -B are ignored.");
	console.log("\t-s <sourcepath>, \n\t--source-path=<sourcepath>\tProvide a path to the actual source files, this will be used to find the file to use when printing the lines from the source file. Default is ./");

	console.log("");
	console.log("");
	return ;
}

if (process.argv.length <= 2) {
	showHelp();
	return ;
}

var argv = require('minimist')(process.argv.slice(2), {
	alias: {
		"h": "help",
		"v":"version",
		"s": "source-path"
	}
});

if(argv["help"]) {
	showHelp();
	return ;
}

if(argv["version"]) {
	console.log("");
	console.log("sourcemap-lookup v" + require("./package.json").version);
	console.log("\tby Ken Koch <kkoch986@gmail.com> © 2016");
	console.log("");
	return ;
}

var source = argv._[0].split(":");
var file = source[0];
var line = parseInt(source[1]);
var col = parseInt(source[2]);
var sourceDirectory = argv["source-path"] || "./";
var linesBefore = parseInt(argv["C"] || argv["B"]) || 5;
var linesAfter = parseInt(argv["C"] || argv["A"]) || 5;


// make sure a string is always the same length
function pad(str, len) {
	str = str + "";
	while(str.length < len) {
		str = str + " ";
	}
	return str;
}

console.log("");
var fs = require("fs");
var sourceMap = require('source-map');
fs.readFile(file + ".map", 'utf8', function (err, data) {
    if (err) throw err; // we'll not consider error handling for now
	var obj = JSON.parse(data);
	var smc = new sourceMap.SourceMapConsumer(obj);
	var originalPosition = smc.originalPositionFor({
		line: line,
		column: col
	});

	console.log("Original Position: \n\t" + originalPosition.source + ", Line " + originalPosition.line + ":" + originalPosition.column);
	console.log("");

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
					var minLine = Math.max(0, line-(linesBefore + 1));
					var maxLine = Math.min(lines.length, line+linesAfter);
					var code = lines.slice(minLine, maxLine);
					console.log("Code Section: ");
					var padLength = Math.max(("" + minLine).length, ("" + maxLine).length) + 1;


					function formatLineNumber(currentLine) {
						if (currentLine == line) {
							return (pad(currentLine, padLength - 1) + ">| ").bold.red;
						} else {
							return pad(currentLine, padLength) + "| ";
						}
					}

					var currentLine = minLine;
					for(var i = 0 ; i < code.length ; i++) {
						console.log(formatLineNumber(++currentLine) + code[i]);
						if (currentLine == line && originalPosition.column) {
							console.log(pad('', padLength + 2 + originalPosition.column) + '^'.bold.red);
						}
					}
				}

				console.log("");
				console.log("");
			});
		}
	});
});
