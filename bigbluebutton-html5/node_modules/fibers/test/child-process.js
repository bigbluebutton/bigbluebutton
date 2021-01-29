// gh-20
var Fiber = require('fibers');

function main() {
	var proc = require('child_process').spawn(
		process.execPath,
		[process.argv[1], 'child'],
		{env: process.env}
	);
	function ondata(data) {
		process.stdout.write(data+ '');
	}
	proc.stdout.on('data', ondata);
	proc.stderr.on('data', ondata);
}

function child() {
	var fn = Fiber(function() {
		Fiber.yield('pa');
		return 'ss';
	});
	var r1 = fn.run();
	var r2 = fn.run();
	console.log(r1+ r2);
}

process.argv[2] === 'child' ? child() : main();
