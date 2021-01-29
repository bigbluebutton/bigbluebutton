'use strict'

var util = require('util')

function RedisError (message, stack) {
  Object.defineProperty(this, 'message', {
    value: message || '',
    configurable: true,
    writable: true
  })
  if (stack || stack === undefined) {
    Error.captureStackTrace(this, RedisError)
  }
}

util.inherits(RedisError, Error)

Object.defineProperty(RedisError.prototype, 'name', {
  value: 'RedisError',
  configurable: true,
  writable: true
})

module.exports = RedisError
