'use strict';
// This test must be run with --force-async-hooks-checks
if (process.versions.modules < 57) {
	console.log('pass');
	return;
}
const { AsyncResource } = require('async_hooks');
const Fiber = require('fibers');

class TestResource extends AsyncResource {
	constructor() {
		super('TestResource');
	}

	run(cb) {
		// In the v8 API, only emitBefore() and emitAfter() are available
		if (process.versions.modules < 59) {
			this.emitBefore();
			cb();
			this.emitAfter();
		} else {
			// In v9 and higher, emitBefore() and emitAfter() are deperecated in favor of runInAsyncScope().
			this.runInAsyncScope(cb);
		}
	}
}

let tmp = Fiber(function() {
	let resource = new TestResource;
	resource.run(function() {
		Fiber.yield();
	});
});
tmp.run();
setTimeout(function() {
	tmp.run();
	console.log('pass');
}, 5);
