'use strict';

var format = require('./format');

var _require = require('triple-beam'),
    MESSAGE = _require.MESSAGE;

var jsonStringify = require('fast-safe-stringify');
/*
 * function replacer (key, value)
 * Handles proper stringification of Buffer and bigint output.
 */


function replacer(key, value) {
  if (value instanceof Buffer) return value.toString('base64'); // eslint-disable-next-line valid-typeof

  if (typeof value === 'bigint') return value.toString();
  return value;
}
/*
 * function json (info)
 * Returns a new instance of the JSON format that turns a log `info`
 * object into pure JSON. This was previously exposed as { json: true }
 * to transports in `winston < 3.0.0`.
 */


module.exports = format(function (info) {
  var opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  info[MESSAGE] = (opts.stable ? jsonStringify.stableStringify : jsonStringify)(info, opts.replacer || replacer, opts.space);
  return info;
});