# sourcemap-lookup
A tool for consuming source maps.

Built because we regularly get bug reports in the form of line numbers and column numbers in our compiled and minified react code.
Since webpack outputs the map files I built this command line tool for taking a path to the map file and the reported line/column number
and outputs the path to the source file and what line/column it maps to. If it can find the source file, it'll also print out the 
actual code in that location.

# Usage

TODO
