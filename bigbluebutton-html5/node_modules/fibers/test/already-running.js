// gh-8
var Fiber = require('fibers');
try {
	Fiber(function() {
		var that = Fiber.current;
		Fiber(function(){
			that.run();
		}).run();
	}).run();
} catch(err) {
	console.log('pass');
}
