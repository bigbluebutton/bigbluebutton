var Fiber = require('fibers');

function Fibonacci() {
	return Fiber.prototype.run.bind(Fiber(function() {
    Fiber.yield(0); // F(0) -> 0
    var prev = 0, curr = 1;
    while (true) {
      Fiber.yield(curr);
      var tmp = prev + curr;
      prev = curr;
      curr = tmp;
    }
  }));
}

var seq = Fibonacci(), results = [];
for (var ii = seq(); ii <= 1597; ii = seq()) {
	results.push(ii);
}

if (results+ '' !== '0,1,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987,1597') {
	throw new Error;
}
console.log('pass');
