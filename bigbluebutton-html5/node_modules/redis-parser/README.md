[![Build Status](https://travis-ci.org/NodeRedis/node-redis-parser.png?branch=master)](https://travis-ci.org/NodeRedis/node-redis-parser)
[![Test Coverage](https://codeclimate.com/github/NodeRedis/node-redis-parser/badges/coverage.svg)](https://codeclimate.com/github/NodeRedis/node-redis-parser/coverage)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

# redis-parser

A high performance javascript redis parser built for [node_redis](https://github.com/NodeRedis/node_redis) and [ioredis](https://github.com/luin/ioredis). Parses all [RESP](http://redis.io/topics/protocol) data.

## Install

Install with [NPM](https://npmjs.org/):

    npm install redis-parser

## Usage

```js
var Parser = require('redis-parser');

var myParser = new Parser(options);
```

### Options

* `returnReply`: *function*; mandatory
* `returnError`: *function*; mandatory
* `returnFatalError`: *function*; optional, defaults to the returnError function
* `returnBuffers`: *boolean*; optional, defaults to false
* `stringNumbers`: *boolean*; optional, defaults to false

### Functions

* `reset()`: reset the parser to it's initial state
* `setReturnBuffers(boolean)`: (JSParser only) set the returnBuffers option on/off without resetting the parser
* `setStringNumbers(boolean)`: (JSParser only) set the stringNumbers option on/off without resetting the parser

### Error classes

* `RedisError` sub class of Error
* `ReplyError` sub class of RedisError
* `ParserError` sub class of RedisError

All Redis errors will be returned as `ReplyErrors` while a parser error is returned as `ParserError`.  
All error classes are exported by the parser.

### Example

```js
var Parser = require("redis-parser");

function Library () {}

Library.prototype.returnReply = function (reply) { ... }
Library.prototype.returnError = function (err) { ... }
Library.prototype.returnFatalError = function (err) { ... }

var lib = new Library();

var parser = new Parser({
    returnReply: function(reply) {
        lib.returnReply(reply);
    },
    returnError: function(err) {
        lib.returnError(err);
    },
    returnFatalError: function (err) {
        lib.returnFatalError(err);
    }
});

Library.prototype.streamHandler = function () {
    this.stream.on('data', function (buffer) {
        // Here the data (e.g. `new Buffer('$5\r\nHello\r\n'`)) is passed to the parser and the result is passed to either function depending on the provided data.
        parser.execute(buffer);
    });
};
```
You do not have to use the returnFatalError function. Fatal errors will be returned in the normal error function in that case.

And if you want to return buffers instead of strings, you can do this by adding the `returnBuffers` option.

If you handle with big numbers that are to large for JS (Number.MAX_SAFE_INTEGER === 2^53 - 16) please use the `stringNumbers` option. That way all numbers are going to be returned as String and you can handle them safely.

```js
// Same functions as in the first example

var parser = new Parser({
    returnReply: function(reply) {
        lib.returnReply(reply);
    },
    returnError: function(err) {
        lib.returnError(err);
    },
    returnBuffers: true, // All strings are returned as Buffer e.g. <Buffer 48 65 6c 6c 6f>
    stringNumbers: true // All numbers are returned as String
});

// The streamHandler as above
```

## Protocol errors

To handle protocol errors (this is very unlikely to happen) gracefully you should add the returnFatalError option, reject any still running command (they might have been processed properly but the reply is just wrong), destroy the socket and reconnect. Note that while doing this no new command may be added, so all new commands have to be buffered in the meantime, otherwise a chunk might still contain partial data of a following command that was already processed properly but answered in the same chunk as the command that resulted in the protocol error.

## Contribute

The parser is highly optimized but there may still be further optimizations possible.

    npm install
    npm test
    npm run benchmark

Currently the benchmark compares the performance against the hiredis parser:

    HIREDIS: $ multiple chunks in a bulk string x 859,880 ops/sec ±1.22% (82 runs sampled)
    HIREDIS BUF: $ multiple chunks in a bulk string x 608,869 ops/sec ±1.72% (85 runs sampled)
    JS PARSER: $ multiple chunks in a bulk string x 910,590 ops/sec ±0.87% (89 runs sampled)
    JS PARSER BUF: $ multiple chunks in a bulk string x 1,299,507 ops/sec ±2.18% (84 runs sampled)

    HIREDIS: + multiple chunks in a string x 1,787,203 ops/sec ±0.58% (96 runs sampled)
    HIREDIS BUF: + multiple chunks in a string x 943,584 ops/sec ±1.62% (87 runs sampled)
    JS PARSER: + multiple chunks in a string x 2,008,264 ops/sec ±1.01% (91 runs sampled)
    JS PARSER BUF: + multiple chunks in a string x 2,045,546 ops/sec ±0.78% (91 runs sampled)

    HIREDIS: $ 4mb bulk string x 310 ops/sec ±1.58% (75 runs sampled)
    HIREDIS BUF: $ 4mb bulk string x 471 ops/sec ±2.28% (78 runs sampled)
    JS PARSER: $ 4mb bulk string x 747 ops/sec ±2.43% (85 runs sampled)
    JS PARSER BUF: $ 4mb bulk string x 846 ops/sec ±5.52% (72 runs sampled)

    HIREDIS: + simple string x 2,324,866 ops/sec ±1.61% (90 runs sampled)
    HIREDIS BUF: + simple string x 1,085,823 ops/sec ±2.47% (82 runs sampled)
    JS PARSER: + simple string x 4,567,358 ops/sec ±1.97% (81 runs sampled)
    JS PARSER BUF: + simple string x 5,433,901 ops/sec ±0.66% (93 runs sampled)

    HIREDIS: : integer x 2,332,946 ops/sec ±0.47% (93 runs sampled)
    JS PARSER: : integer x 17,730,449 ops/sec ±0.73% (91 runs sampled)
    JS PARSER STR: : integer x 12,942,037 ops/sec ±0.51% (92 runs sampled)

    HIREDIS: : big integer x 2,012,572 ops/sec ±0.33% (93 runs sampled)
    JS PARSER: : big integer x 10,210,923 ops/sec ±0.94% (94 runs sampled)
    JS PARSER STR: : big integer x 4,453,320 ops/sec ±0.52% (94 runs sampled)

    HIREDIS: * array x 44,479 ops/sec ±0.55% (94 runs sampled)
    HIREDIS BUF: * array x 14,391 ops/sec ±1.04% (86 runs sampled)
    JS PARSER: * array x 53,796 ops/sec ±2.08% (79 runs sampled)
    JS PARSER BUF: * array x 72,428 ops/sec ±0.72% (93 runs sampled)

    HIREDIS: * big nested array x 217 ops/sec ±0.97% (83 runs sampled)
    HIREDIS BUF: * big nested array x 255 ops/sec ±2.28% (77 runs sampled)
    JS PARSER: * big nested array x 242 ops/sec ±1.10% (85 runs sampled)
    JS PARSER BUF: * big nested array x 375 ops/sec ±1.21% (88 runs sampled)

    HIREDIS: - error x 78,821 ops/sec ±0.80% (93 runs sampled)
    JS PARSER: - error x 143,382 ops/sec ±0.75% (92 runs sampled)

    Platform info:
    Ubuntu 16.10
    Node.js 7.4.0
    Intel(R) Core(TM) i7-5600U CPU

## License

[MIT](./LICENSE)
