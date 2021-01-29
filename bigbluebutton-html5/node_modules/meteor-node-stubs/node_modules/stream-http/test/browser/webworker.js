var fs = require('fs')
var test = require('tape')
var UAParser = require('ua-parser-js')
var url = require('url')
var work = require('webworkify')

var reference = fs.readFileSync(__dirname + '/../server/static/browserify.png')

// Temporarily disabled due to https://github.com/browserify/webworkify/issues/41
test.skip('binary download in WebWorker', function (t) {
	// We have to use a global url, since webworkify puts the worker in a Blob,
	// which doesn't have a proper location
	var testUrl = url.resolve(global.location.href, '/browserify.png')
	var worker = work(require('./lib/webworker-worker.js'))
	worker.addEventListener('message', function (ev) {
		var data = new Buffer(new Uint8Array(ev.data))
		t.ok(reference.equals(data), 'contents match')
		t.end()
	})
	worker.postMessage(testUrl)
})