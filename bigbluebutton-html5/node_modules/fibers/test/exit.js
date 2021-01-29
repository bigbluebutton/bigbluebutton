var Fiber = require('fibers');
if (!process.stdout.write('pass\n')) {
	process.stdout.on('drain', go);
} else {
	go();
}
function go() {
	// Windows needs some time to flush the output and I can't figure out a better way
	setTimeout(function() {
		Fiber(function() {
			process.exit();
		}).run();
		console.log('fail');
	}, 10);
}
