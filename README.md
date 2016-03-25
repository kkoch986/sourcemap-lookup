# sourcemap-lookup
A tool for consuming source maps.

Built because we regularly get bug reports in the form of line numbers and column numbers in our compiled and minified react code.
Since webpack outputs the map files I built this command line tool for taking a path to the map file and the reported line/column number
and outputs the path to the source file and what line/column it maps to. If it can find the source file, it'll also print out the 
actual code in that location.

# Usage

Install with `npm install -g sourcemap-lookup`, then run `sourcemap-lookup -h` for detailed usage.

```
Usage: 
	sourcemap-lookup <path/to/map/file>:<line number>:<column number> [options]

Path to map file may include the .map or it will be assumed and added automatically.

valid [options]:
	-h, --help		Show this help message.
	-v, --version		Show current version.
	-A		 The number of lines to print after the target line. Default is 5.
	-B		 The number of lines to print before the target line. Default is 5.
	-C		 The number of lines to print before and after the target line. If supplied, -A and -B are ignored.
	-s <sourcepath>, 
	--source-path=<sourcepath>	Provide a path to the actual source files, this will be used to find the file to use when printing the lines from the source file. Default is ../../
```

# Example output

Ran the following command: `sourcemap-lookup build/v2.0.19/product.js:24673:19 -s ./` to get this output:

```

Original Position: 
	webpack:///~/react/lib/ReactTransitionGroup.js?bd5c, Line 107:0

Code Section: 
102 |     }
103 |   },
104 | 
105 |   _handleDoneAppearing: function (key) {
106 |     var component = this.refs[key];
107 |     if (component.componentDidAppear) {
108 |       component.componentDidAppear();
109 |     }
110 | 
111 |     delete this.currentlyTransitioningKeys[key];
112 | 


```
