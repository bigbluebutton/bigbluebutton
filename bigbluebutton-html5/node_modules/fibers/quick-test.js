"use strict"
var Fiber = require('./fibers');
var fiber = Fiber(function() {
	process.stdout.write(Fiber.yield());
});
fiber.run();
fiber.run('pass');
