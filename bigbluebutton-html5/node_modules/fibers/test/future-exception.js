var Fiber = require('fibers');
var Future = require('future');

// Possible outputs:
// pass: exception is thrown and caught in uncaughtException
// fail: exception is thrown and not caught
// no output: process dies


var thrown = false;
var caught = false;

var async = function(continuation) {
	process.nextTick(function() {
		continuation();
	});
}

process.on('uncaughtException', function(err) {
	if (err.message === 'Catch me if you can') {
		caught = true;
	} else {
		throw err;
	}
});

// This fiber's job is to throw an exception after yielding.
Fiber(function() {
	// yield and resume via Future.wait() and its cb() helper
	var sync = Future.wrap(async)();
	sync.wait();

	// this should get rethrown to the main event loop
	thrown = true;
	throw new Error('Catch me if you can');
}).run();

// This fiber's job is to make sure the process is still alive after the
// exception was thrown.
Fiber(function() {
	// wait for other fiber to throw exception and yield
	while (!thrown) {
		var sync = Future.wrap(async)();
		sync.wait();
	}

	// wait once more to allow exception to get caught
	process.nextTick(function() {
		// see if we have noticed the exception we expect to
		console.log(caught ? 'pass' : 'fail');
	});
}).run();
