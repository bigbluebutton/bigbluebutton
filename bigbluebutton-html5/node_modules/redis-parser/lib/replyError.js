'use strict'

var util = require('util')
var RedisError = require('./redisError')
var ADD_STACKTRACE = false

function ReplyError (message) {
  var tmp = Error.stackTraceLimit
  Error.stackTraceLimit = 2
  RedisError.call(this, message, ADD_STACKTRACE)
  Error.captureStackTrace(this, ReplyError)
  Error.stackTraceLimit = tmp
}

util.inherits(ReplyError, RedisError)

Object.defineProperty(ReplyError.prototype, 'name', {
  value: 'ReplyError',
  configurable: true,
  writable: true
})

module.exports = ReplyError
