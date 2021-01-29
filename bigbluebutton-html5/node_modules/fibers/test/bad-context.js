var Fiber = require('fibers');

try {
	Fiber.prototype.run.call(null);
} catch (err) {
	console.log('pass');
}
