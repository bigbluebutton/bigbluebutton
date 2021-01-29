var Fiber = require('fibers');
try {
	Fiber(function() {
		function foo() {
			var hello = Math.random();
			foo();
		}
		foo();
	}).run();
} catch (err) {
	err.name === 'RangeError' && console.log('pass');
}
