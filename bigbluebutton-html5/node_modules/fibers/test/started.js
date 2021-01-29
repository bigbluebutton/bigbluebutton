// gh-12
var Fiber = require('fibers');
Fiber(function() {
	if (!Fiber.current.started) {
		throw new Error;
	}
}).run();
console.log('pass');
