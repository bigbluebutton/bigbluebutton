// Copyright (c) 2012, Ben Noordhuis <info@bnoordhuis.nl>
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

function testSigUsr2(test){
  var server = http.createServer(function(req, res) {
    res.writeHeader(200, {'Content-Type':'text/plain;charset=utf-8',
                          'Content-Length':'2'});
    res.end('OK');
  });

  server.on('listening', function(){
    console.log('Listening on http://127.0.0.1:8000/');
    console.log('now sending SIGUSR2 to %d', process.pid);

    var heapSnapshotFile = 'heapdump-*.heapsnapshot';
    shelljs.rm('-f', heapSnapshotFile);

    var killCmd = shelljs.which('kill');
    var cmd = [killCmd, '-usr2', process.pid].join(' ');
    shelljs.exec(cmd);

    function waitForHeapdump(){
      var files = shelljs.ls(heapSnapshotFile);
      test.equals(files.length, 1, 'Heap file should be present');
      server.close();
      test.end();
    }

    setTimeout(waitForHeapdump, 500);
  });

  server.listen(0);
}

test('test heapdump on SIGUSR2', testSigUsr2);
