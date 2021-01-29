// gh-16
var Fiber = require('fibers');
Fiber(function() {
	Fiber(function() {
		Fiber(function() {}).run();
	}).run();
}).run();
console.log('pass');
