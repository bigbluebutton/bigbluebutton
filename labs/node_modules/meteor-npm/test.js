Tinytest.add('Async.runSync - with done()', function(test) {
  var output = Async.runSync(function(done) {
    setTimeout(function() {
      done(null, 10001);
    }, 10);
  });

  test.equal(output.result, 10001);
  test.equal(output.error, null);
});

Tinytest.add('Async.runSync - with error()', function(test) {
  var output = Async.runSync(function(done) {
    setTimeout(function() {
      done({message: 'error-message', code: 402});
    }, 10);
  });

  test.equal(output.result, undefined);
  test.equal(output.error.code, 402);
});

Tinytest.add('Async.runSync - with error in the callback', function(test) {
  var output = Async.runSync(function(done) {
    throw new Error('SOME_ERROR');
  });

  test.equal(output.result, undefined);
  test.equal(output.error.message, 'SOME_ERROR');
});

Tinytest.add('Async.wrap function mode - success', function(test) {
  function wait(timeout, callback) {
    setTimeout(function() {
      callback(null, 'okay');
    }, timeout);
  };

  var enclosedWait = Async.wrap(wait);
  var output = enclosedWait(100);

  test.equal(output, 'okay');
});

Tinytest.add('Async.wrap function mode - error', function(test) {
  function wait(timeout, callback) {
    setTimeout(function() {
      var error = new Error('THE_ERROR');
      error.code = 500;
      callback(error);
    }, timeout);
  };

  var enclosedWait = Async.wrap(wait);
  try {
    enclosedWait(100);
    test.fail('there must be an error');
  } catch(err) {
    test.ok(err.message.match('THE_ERROR'));
    test.equal(err.code, 500);
  }

});

Tinytest.add('Async.wrap object mode - success', function(test) {
  function Wait() {
    this.start = function(timeout, callback) {
      setTimeout(function() {
        callback(null, 'okay');
      }, timeout);
    };
  }

  var wait = new Wait();

  var enclosedWait = Async.wrap(wait, 'start');

  var output = enclosedWait(100);
  test.equal(output, 'okay');
});

Tinytest.add('Async.wrap object mode - funcName not exists', function(test) {
  function Wait() {
    this.start = function(timeout, callback) {
      setTimeout(function() {
        callback(null, 'okay');
      }, timeout);
    };
  }

  var wait = new Wait();
  try {
    var enclosedWait = Async.wrap(wait, 'startz');
    test.fail('shoud throw an error');
  } catch(ex) {

  }
});

Tinytest.add('Async.wrap object mode - multi function mode', function(test) {
  function Wait() {
    this.start = function(timeout, callback) {
      setTimeout(function() {
        callback(null, 'okay');
      }, timeout);
    };

    this.start2 = function(timeout, callback) {
      setTimeout(function() {
        callback(null, 'okay');
      }, timeout);
    };
  }

  var wait = new Wait();
  var enclosedWait = Async.wrap(wait, ['start', 'start2']);
  enclosedWait.start(100);
  enclosedWait.start2(100);
});