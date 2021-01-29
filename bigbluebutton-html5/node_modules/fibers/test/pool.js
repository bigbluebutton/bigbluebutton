var Fiber = require('fibers');

for (var jj = 0; jj < 10; ++jj) {
	var fibers = [];
	for (var ii = 0; ii < 200; ++ii) {
		var fn = Fiber(function() {
			Fiber.yield();
		});
		fn.run();
		fibers.push(fn);
	}
	for (var ii = 0; ii < fibers.length; ++ii) {
		fibers[ii].run();
	}
}
console.log('pass');
