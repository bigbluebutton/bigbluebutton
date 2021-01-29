"use strict";
var Fiber = require('fibers');
Fiber.poolSize = 100;
let v8 = /^([0-9]+)\.([0-9]+)/.exec(process.versions.v8);
if (v8[1] > 4 || (v8[1] == 4 && v8[2] >= 10)) {

	// Vague benchmark of fiber performance, lower is better
	function bench() {
		var d = new Date;
		for (var ii = 0; ii < 100; ++ii) {
			var fibers = [];
			for (var jj = 0; jj < Fiber.poolSize; ++jj) {
				var fiber = Fiber(function() {
					Fiber.yield();
				});
				fiber.run();
				fibers.push(fiber);
			}
			fibers.map(function(fiber) {
				fiber.run();
			});
		}
		return new Date - d;
	}

	// Run initial benchmark
	var ts1 = Math.min(bench(), bench());

	// Dirty up isolate list
	var fibers = [];
	for (var ii = 0; ii < Fiber.poolSize + 1000; ++ii) {
		let fiber = Fiber(function() {
			Fiber.yield();
		});
		fiber.run();
		fibers.push(fiber);
	}
	fibers.map(function(fiber) {
		fiber.run();
	});

	// Test again
	var ts2 = Math.min(bench(), bench());
	console.log(ts1 * 2 < ts2 ? 'fail' : 'pass');
} else {

	// Feature is not supported
	console.log('pass');
}
