var Fiber = require('fibers');

var current;
Fiber(function() {
	current = Fiber.current;
	Fiber.yield();
	console.log('pass');
}).run();
if (current) {
	current.run();
} else {
	console.log('fail');
}
