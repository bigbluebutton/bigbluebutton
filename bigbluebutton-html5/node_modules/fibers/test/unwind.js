var Fiber = require('fibers');

var ii;
var fn = Fiber(function() {
	for (ii = 0; ii < 1000; ++ii) {
		try {
			Fiber.yield();
		} catch (err) {}
	}
});

fn.run();
fn.reset();
ii === 1000 && console.log('pass');
