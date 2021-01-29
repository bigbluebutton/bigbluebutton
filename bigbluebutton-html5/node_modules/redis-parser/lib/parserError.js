'use strict'

var util = require('util')
var assert = require('assert')
var RedisError = require('./redisError')
var ADD_STACKTRACE = false

function ParserError (message, buffer, offset) {
  assert(buffer)
  assert.strictEqual(typeof offset, 'number')
  RedisError.call(this, message, ADD_STACKTRACE)
  this.offset = offset
  this.buffer = buffer
  Error.captureStackTrace(this, ParserError)
}

util.inherits(ParserError, RedisError)

Object.defineProperty(ParserError.prototype, 'name', {
  value: 'ParserError',
  configurable: true,
  writable: true
})

module.exports = ParserError
