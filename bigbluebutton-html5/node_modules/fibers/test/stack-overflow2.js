var Fiber = require('fibers');

// Calculate how far we can go recurse without hitting the JS stack limit
function calculateStackSpace() {
	var max = 0;
	function testRecursion(ii) {
		++max;
		testRecursion(ii + 1);
	}
	try {
		testRecursion();
	} catch (err) {}
	return max;
}

// Invoke a RepExp operation that eats a lot of stack space
function pathologicRegExp(preStack) {
	function fn() {
		var foo = '';
		for (var ii = 0; ii < 1024; ++ii) {
			foo += 'a';
		}
		new RegExp(foo, 'g');
	}

	// Recurse to the limit and then invoke a stack-heavy C++ operation
	function wasteStack(ii) {
		ii ? wasteStack(ii - 1) : fn();
	}
	wasteStack(preStack);
}

Fiber(function() {

	// Ensure that this doesn't ruin everything while in a fiber
	var max = calculateStackSpace();
	for (var stack = max; stack > 0; --stack) {
		try {
			pathologicRegExp(stack);
			break;
		} catch (err) {}
	}
}).run();

console.log('pass');
