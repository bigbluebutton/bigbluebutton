// gh-3
var Fiber = require('fibers');
try {
	Fiber.yield();
} catch(err) {
	console.log('pass');
}
