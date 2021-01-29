// Copyright (c) 2014, Ben Noordhuis <info@bnoordhuis.nl>
//
// Permission to use, copy, modify, and/or distribute this software for any
// purpose with or without fee is hereby granted, provided that the above
// copyright notice and this permission notice appear in all copies.
//
// THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
// WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
// ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
// WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
// ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
// OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

try {
  var addon = require('./build/Release/addon');
} catch (e) {
  if (e.code !== 'MODULE_NOT_FOUND') throw e;
  var addon = require('./build/Debug/addon');
}

var kSignalFlag = addon.kSignalFlag;

var flags = kSignalFlag;
var options = (process.env.NODE_HEAPDUMP_OPTIONS || '').split(/\s*,\s*/);
for (var i = 0, n = options.length; i < n; i += 1) {
  var option = options[i];
  if (option === '') continue;
  else if (option === 'signal') flags |= kSignalFlag;
  else if (option === 'nosignal') flags &= ~kSignalFlag;
  else console.error('node-heapdump: unrecognized option:', option);
}
addon.configure(flags);

var os = require('os');
var errno = [];
if (os.constants && os.constants.errno) {
  Object.keys(os.constants.errno).forEach(function(key) {
    var value = os.constants.errno[key];
    errno[value] = key;
  });
}

exports.writeSnapshot = function(filename, cb) {
  if (typeof filename === 'function') cb = filename, filename = undefined;
  var result = addon.writeSnapshot(filename);
  var success = (typeof result === 'string');  // Filename or errno.
  // Make the callback. Yes, this is synchronous; it wasn't back when heapdump
  // forked before writing the snapshot, but it is now. index.js can postpone
  // the callback with process.nextTick() or setImmediate() if synchronicity
  // becomes an issue. Or just remove it, it's pretty pointless now.
  if (cb) {
    if (success) cb(null, result);
    else cb(new Error('heapdump write error ' + (errno[result] || result)));
  }
  return success;
};
