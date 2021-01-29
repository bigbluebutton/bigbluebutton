var Future;
try {
	Future = require('fibers/future');
} catch (err) {
	Future = require('future');
}

function Timer(ms) {
	var future = new Future;
	function ret() {
		future.return();
	}
	ms ? setTimeout(ret, ms) : process.nextTick(ret);
	return future;
}

~function() {
	var timer = new Timer(10), tick = new Timer;
	Future.wait(timer, tick);
	timer.get();
	tick.get();
	return 'pass';
}.future()().resolve(function(err, val) {
	if (err) throw err;
	console.log(val);
});
