// Copyright (c) 2014, Krishna Raman <kraman@gmail.com>
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

var path = require('path');
var http = require('http');
var shelljs = require('shelljs');
var test = require('tap').test;
var heapdump = require('../');

process.chdir(__dirname);

function testFuncCall(test){
  var server = http.createServer(function(req, res) {
    res.writeHeader(200);
    res.end();
  });
  server.on('listening', function(){
    console.log('Listening on http://127.0.0.1:8000/');
    console.log('PID %d', process.pid);

    var heapSnapshotFile = 'heapdump-*.heapsnapshot';
    shelljs.rm('-f', heapSnapshotFile);

    function waitForHeapdump(err, filename) {
      var files = shelljs.ls(heapSnapshotFile);
      test.equals(err, null);
      test.equals(files.length, 1);
      test.equals(filename, files[0]);
      server.close();
      test.end();
    }

    heapdump.writeSnapshot(waitForHeapdump);
  });
  server.listen(0);
}

test('Test writeSnapshot and callback', testFuncCall);
