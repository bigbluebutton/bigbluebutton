fibers(1) -- Fiber support for v8 and Node
==========================================
[![npm version](https://badgen.now.sh/npm/v/fibers)](https://www.npmjs.com/package/fibers)
[![isc license](https://badgen.now.sh/npm/license/fibers)](https://github.com/laverdet/node-fibers/blob/master/LICENSE)
[![travis build](https://badgen.now.sh/travis/laverdet/node-fibers)](https://travis-ci.org/laverdet/node-fibers)
[![npm downloads](https://badgen.now.sh/npm/dm/fibers)](https://www.npmjs.com/package/fibers)

Fibers, sometimes called [coroutines](https://en.wikipedia.org/wiki/Coroutine), are a powerful tool which expose an API to jump between multiple call stacks from within a single thread. This can be useful to make code written for a synchronous library play nicely in an asynchronous environment.

INSTALLING
----------
[![NPM](https://nodei.co/npm/fibers.png)](https://www.npmjs.com/package/fibers)

### via npm
* `npm install fibers`
* You're done! (see "supported platforms" below if you run into errors)

### from source
* `git clone git://github.com/laverdet/node-fibers.git`
* `cd node-fibers`
* `npm install`

Note: node-fibers uses [node-gyp](https://github.com/TooTallNate/node-gyp) for
building. To manually invoke the build process, you can use `node-gyp rebuild`.
This will put the compiled extension in `build/Release/fibers.node`. However,
when you do `require('fibers')`, it will expect the module to be in, for
example, `bin/linux-x64-v8-3.11/fibers.node`. You can manually put the module
here every time you build, or you can use the included build script. Either
`npm install` or `node build -f` will do this for you. If you are going to be
hacking on node-fibers, it may be worthwhile to first do `node-gyp configure`
and then for subsequent rebuilds you can just do `node-gyp build` which will
be faster than a full `npm install` or `node-gyp rebuild`.

### meteor users please read this
If you're trying to get meteor running and you ended up at this page you're
probably doing something wrong. Please uninstall all versions of NodeJS and
Meteor, then start over. See
[meteor#5124](https://github.com/meteor/meteor/issues/5124) for more
information.

### supported platforms
If you are running nodejs version 8.x or 10.x on Linux, OS X, or Windows (7 or later) then you
should be able to install fibers from npm just fine. If you are running nodejs v6.x then you will
need to use `npm install fibers@2`. For nodejs v4.x you can use `npm install fibers@1`. If you are
running an older (or newer) version of node or some other operating system you will have to compile
fibers on your system.

(special thanks to [Jeroen Janssen](https://github.com/japj) for his work on fibers in Windows)

If you do end up needing to compile fibers first make sure you have node-gyp installed as a global
dependency (`npm install -g node-gyp`), and that you have setup your build environment by following
the instructions at [node-gyp](https://github.com/TooTallNate/node-gyp). Ubuntu-flavored Linux users
may need to run `sudo apt-get install g++` as well.


EXAMPLES
--------

The examples below describe basic use of `Fiber`, but note that it is **not
recommended** to use `Fiber` without an abstraction in between your code and
fibers. See "FUTURES" below for additional information.

### Sleep
This is a quick example of how you can write sleep() with fibers. Note that
while the sleep() call is blocking inside the fiber, node is able to handle
other events.

	$ cat sleep.js

```javascript
var Fiber = require('fibers');

function sleep(ms) {
	var fiber = Fiber.current;
	setTimeout(function() {
		fiber.run();
	}, ms);
	Fiber.yield();
}

Fiber(function() {
	console.log('wait... ' + new Date);
	sleep(1000);
	console.log('ok... ' + new Date);
}).run();
console.log('back in main');
```

	$ node sleep.js
	wait... Fri Jan 21 2011 22:42:04 GMT+0900 (JST)
	back in main
	ok... Fri Jan 21 2011 22:42:05 GMT+0900 (JST)


### Incremental Generator
Yielding execution will resume back in the fiber right where you left off. You
can also pass values back and forth through yield() and run(). Again, the node
event loop is never blocked while this script is running.

	$ cat generator.js

```javascript
var Fiber = require('fibers');

var inc = Fiber(function(start) {
	var total = start;
	while (true) {
		total += Fiber.yield(total);
	}
});

for (var ii = inc.run(1); ii <= 10; ii = inc.run(1)) {
	console.log(ii);
}
```

	$ node generator.js
	1
	2
	3
	4
	5
	6
	7
	8
	9
	10


### Fibonacci Generator
Expanding on the incremental generator above, we can create a generator which
returns a new Fibonacci number with each invocation. You can compare this with
the [ECMAScript Harmony
Generator](http://wiki.ecmascript.org/doku.php?id=harmony:generators) Fibonacci
example.

	$ cat fibonacci.js

```javascript
var Fiber = require('fibers');

// Generator function. Returns a function which returns incrementing
// Fibonacci numbers with each call.
function Fibonacci() {
	// Create a new fiber which yields sequential Fibonacci numbers
	var fiber = Fiber(function() {
		Fiber.yield(0); // F(0) -> 0
		var prev = 0, curr = 1;
		while (true) {
			Fiber.yield(curr);
			var tmp = prev + curr;
			prev = curr;
			curr = tmp;
		}
	});
	// Return a bound handle to `run` on this fiber
	return fiber.run.bind(fiber);
}

// Initialize a new Fibonacci sequence and iterate up to 1597
var seq = Fibonacci();
for (var ii = seq(); ii <= 1597; ii = seq()) {
	console.log(ii);
}
```

	$ node fibonacci.js
	0
	1
	1
	2
	3
	5
	8
	13
	21
	34
	55
	89
	144
	233
	377
	610
	987
	1597


### Basic Exceptions
Fibers are exception-safe; exceptions will continue travelling through fiber
boundaries:

	$ cat error.js

```javascript
var Fiber = require('fibers');

var fn = Fiber(function() {
	console.log('async work here...');
	Fiber.yield();
	console.log('still working...');
	Fiber.yield();
	console.log('just a little bit more...');
	Fiber.yield();
	throw new Error('oh crap!');
});

try {
	while (true) {
		fn.run();
	}
} catch(e) {
	console.log('safely caught that error!');
	console.log(e.stack);
}
console.log('done!');
```

	$ node error.js
	async work here...
	still working...
	just a little bit more...
	safely caught that error!
	Error: oh crap!
			at error.js:11:9
	done!


FUTURES
-------

Using the `Fiber` class without an abstraction in between your code and the raw
API is **not recommended**. `Fiber` is meant to implement the smallest amount of
functionality in order make possible many different programming patterns. This
makes the `Fiber` class relatively lousy to work with directly, but extremely
powerful when coupled with a decent abstraction. There is no right answer for
which abstraction is right for you and your project. Included with `node-fibers`
is an implementation of "futures" which is fiber-aware. Usage of this library
is documented below. There are several other externally-maintained options
which can be found on the [wiki](https://github.com/laverdet/node-fibers/wiki).
You **should** feel encouraged to be creative with fibers and build a solution
which works well with your project. For instance, `Future` is not a good
abstraction to use if you want to build a generator function (see Fibonacci
example above).

Using `Future` to wrap existing node functions. At no point is the node event
loop blocked:

	$ cat ls.js

```javascript
var Future = require('fibers/future');
var fs = Future.wrap(require('fs'));

Future.task(function() {
	// Get a list of files in the directory
	var fileNames = fs.readdirFuture('.').wait();
	console.log('Found '+ fileNames.length+ ' files');

	// Stat each file
	var stats = [];
	for (var ii = 0; ii < fileNames.length; ++ii) {
		stats.push(fs.statFuture(fileNames[ii]));
	}
	stats.map(function(f) {
		f.wait()
	});

	// Print file size
	for (var ii = 0; ii < fileNames.length; ++ii) {
		console.log(fileNames[ii]+ ': '+ stats[ii].get().size);
	}
}).detach();
```

	$ node ls.js 
	Found 11 files
	bin: 4096
	fibers.js: 1708
	.gitignore: 37
	README.md: 8664
	future.js: 5833
	.git: 4096
	LICENSE: 1054
	src: 4096
	ls.js: 860
	Makefile: 436
	package.json: 684


The future API is designed to make it easy to move between classic
callback-style code and fiber-aware waiting code:

	$ cat sleep.js

```javascript
var Future = require('fibers/future'), wait = Future.wait;

// This function returns a future which resolves after a timeout. This
// demonstrates manually resolving futures.
function sleep(ms) {
	var future = new Future;
	setTimeout(function() {
		future.return();
	}, ms);
	return future;
}

// You can create functions which automatically run in their own fiber and
// return futures that resolve when the fiber returns (this probably sounds
// confusing.. just play with it to understand).
var calcTimerDelta = function(ms) {
	var start = new Date;
	sleep(ms).wait();
	return new Date - start;
}.future(); // <-- important!

// And futures also include node-friendly callbacks if you don't want to use
// wait()
calcTimerDelta(2000).resolve(function(err, val) {
	console.log('Set timer for 2000ms, waited '+ val+ 'ms');
});
```

	$ node sleep.js
	Set timer for 2000ms, waited 2009ms


API DOCUMENTATION
-----------------
Fiber's definition looks something like this:

```javascript
/**
 * Instantiate a new Fiber. You may invoke this either as a function or as
 * a constructor; the behavior is the same.
 *
 * When run() is called on this fiber for the first time, `fn` will be
 * invoked as the first frame on a new stack. Execution will continue on
 * this new stack until `fn` returns, or Fiber.yield() is called.
 *
 * After the function returns the fiber is reset to original state and
 * may be restarted with another call to run().
 */
function Fiber(fn) {
	[native code]
}

/**
 * `Fiber.current` will contain the currently-running Fiber. It will be
 * `undefined` if there is no fiber (i.e. the main stack of execution).
 *
 * See "Garbage Collection" for more information on responsible use of
 * `Fiber.current`.
 */
Fiber.current = undefined;

/**
 * `Fiber.yield()` will halt execution of the current fiber and return control
 * back to original caller of run(). If an argument is supplied to yield(),
 * run() will return that value.
 *
 * When run() is called again, yield() will return.
 *
 * Note that this function is a global to allow for correct garbage
 * collection. This results in no loss of functionality because it is only
 * valid to yield from the currently running fiber anyway.
 *
 * Note also that `yield` is a reserved word in Javascript. This is normally
 * not an issue, however some code linters may complain. Rest assured that it
 * will run fine now and in future versions of Javascript.
 */
Fiber.yield = function(param) {
	[native code]
}

/**
 * run() will start execution of this Fiber, or if it is currently yielding,
 * it will resume execution. If an argument is supplied, this argument will
 * be passed to the fiber, either as the first parameter to the main
 * function [if the fiber has not been started] or as the return value of
 * yield() [if the fiber is currently yielding].
 *
 * This function will return either the parameter passed to yield(), or the
 * returned value from the fiber's main function.
 */
Fiber.prototype.run = function(param) {
	[native code]
}

/**
 * reset() will terminate a running Fiber and restore it to its original
 * state, as if it had returned execution.
 *
 * This is accomplished by causing yield() to throw an exception, and any
 * futher calls to yield() will also throw an exception. This continues
 * until the fiber has completely unwound and returns.
 *
 * If the fiber returns a value it will be returned by reset().
 *
 * If the fiber is not running, reset() will have no effect.
 */
Fiber.prototype.reset = function() {
	[native code]
}

/**
 * throwInto() will cause a currently yielding fiber's yield() call to
 * throw instead of return gracefully. This can be useful for notifying a
 * fiber that you are no longer interested in its task, and that it should
 * give up.
 *
 * Note that if the fiber does not handle the exception it will continue to
 * bubble up and throwInto() will throw the exception right back at you.
 */
Fiber.prototype.throwInto = function(exception) {
	[native code]
}
```


Future's definition looks something like this:

```javascript
/**
 * Returns a future-function which, when run, starts running the target
 * function and returns a future for the result.
 * 
 * Example usage: 
 * var funcy = function(arg) {
 *   return arg+1;
 * }.future();
 * 
 * funcy(1).wait(); // returns 2
 */
Function.prototype.future = function() { ... }

/**
 * Future object, instantiated with the new operator.
 */
function Future() {}

/**
 * Wrap a node-style async function to return a future in place of using a callback.
 * 
 * fn - the function or object to wrap
 * array - indicates that this callback will return more than 1 argument after `err`. For example,
 *         `child_process.exec()` returns [err, stdout, stderr]
 * suffix - appends a string to every method that was overridden, if you passed an object
 * 
 * Example usage: Future.wrap(asyncFunction)(arg1).wait()
 */
Future.wrap = function(fn, multi, suffix) { ... }

/**
 * Invoke a function that will be run in its own fiber context and return a future to its return
 * value.
 *
 * Example:
 * Future.task(function() {
 *   // You can safely `wait` on stuff here
 * }).detach();
 */
Future.task = function(fn) { ... }

/**
 * Wait on a series of futures and then return. If the futures throw an exception this function
 * /won't/ throw it back. You can get the value of the future by calling get() on it directly. If
 * you want to wait on a single future you're better off calling future.wait() on the instance.
 * 
 * Example usage: Future.wait(aFuture, anotherFuture)
 */
Future.wait = function(/* ... */) { ... }

/**
 * Return the value of this future. If the future hasn't resolved yet this will throw an error.
 */
Future.prototype.get = function() { ... }

/**
 * Mark this future as returned. All pending callbacks will be invoked immediately.
 * 
 * value - the value to return when get() or wait() is called.
 * 
 * Example usage: aFuture.return(value)
 */
Future.prototype.return = function(value) { ... }

/**
 * Throw from this future as returned. All pending callbacks will be invoked immediately.
 * Note that execution will continue normally after running this method, 
 * so make sure you exit appropriately after running throw()
 * 
 * error - the error to throw when get() or wait() is called.
 * 
 * Example usage: aFuture.throw(new Error("Something borked"))
 */
Future.prototype.throw = function(error) { ... }

/**
 * "detach" this future. Basically this is useful if you want to run a task in a future, you
 * aren't interested in its return value, but if it throws you don't want the exception to be
 * lost. If this fiber throws, an exception will be thrown to the event loop and node will
 * probably fall down.
 */
Future.prototype.detach = function() { ... }

/**
 * Returns whether or not this future has resolved yet.
 */
Future.prototype.isResolved = function() { ... }

/**
 * Returns a node-style function which will mark this future as resolved when called.
 * 
 * Example usage: 
 *   var errback = aFuture.resolver();
 *   asyncFunction(arg1, arg2, etc, errback)
 *   var result = aFuture.wait();
 */
Future.prototype.resolver = function() { ... }

/**
 * Waits for this future to resolve and then invokes a callback.
 *
 * If only one argument is passed it is a standard function(err, val){} errback.
 *
 * If two arguments are passed, the first argument is a future which will be thrown to in the case
 * of error, and the second is a function(val){} callback.
 */
Future.prototype.resolve = function(/* errback or future, callback */) { ... }

/**
 * Propogate results to another future.
 * 
 * Example usage: future1.proxy(future2) // future2 gets automatically resolved with however future1 resolves
 */
Future.prototype.proxy = function(future) { ... }

/**
 * Differs from its functional counterpart in that it actually resolves the future. Thus if the
 * future threw, future.wait() will throw.
 */
Future.prototype.wait = function() { ... }

/**
 * Support for converting a Future to and from ES6 Promises.
 */
Future.fromPromise = function(promise) { ... }
Future.prototype.promise = function() { ... }
```

GARBAGE COLLECTION
------------------

If you intend to build generators, iterators, or "lazy lists", you should be
aware that all fibers must eventually unwind. This is implemented by causing
yield() to throw unconditionally when the library is trying to unwind your
fiber-- either because reset() was called, or all handles to the fiber were lost
and v8 wants to delete it.

Something like this will, at some point, cause an infinite loop in your
application:

```javascript
var fiber = Fiber(function() {
	while (true) {
		try {
			Fiber.yield();
		} catch(e) {}
	}
});
fiber.run();
```

If you either call reset() on this fiber, or the v8 garbage collector decides it
is no longer in use, the fiber library will attempt to unwind the fiber by
causing all calls to yield() to throw. However, if you catch these exceptions
and continue anyway, an infinite loop will occur.

There are other garbage collection issues that occur with misuse of fiber
handles. If you grab a handle to a fiber from within itself, you should make
sure that the fiber eventually unwinds. This application will leak memory:

```javascript
var fiber = Fiber(function() {
	var that = Fiber.current;
	Fiber.yield();
}
fiber.run();
fiber = undefined;
```

There is no way to get back into the fiber that was started, however it's
impossible for v8's garbage collector to detect this. With a handle to the fiber
still outstanding, v8 will never garbage collect it and the stack will remain in
memory until the application exits.

Thus, you should take care when grabbing references to `Fiber.current`.
