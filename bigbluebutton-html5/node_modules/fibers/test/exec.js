// gh-1
var Fiber = require('fibers');

if (process.platform == 'win32') {
	// There is a problem with running this from a script. Not fibers related.
	console.log('pass');
} else {
	Fiber(function() {
		require('child_process').exec('echo pass', function(err, stdout) {
			if (err) console.log(err);
			process.stdout.write(stdout);
		});
	}).run();
}
