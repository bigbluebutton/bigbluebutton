var Buffer = require('buffer').Buffer
var fs = require('fs')
var test = require('tape')
var UAParser = require('ua-parser-js')

var http = require('../..')

var COPIES = 20
var MIN_PIECES = 2

var referenceOnce = fs.readFileSync(__dirname + '/../server/static/browserify.png')
var reference = new Buffer(referenceOnce.length * COPIES)
for(var i = 0; i < COPIES; i++) {
	referenceOnce.copy(reference, referenceOnce.length * i)
}

test('binary streaming', function (t) {
	http.get({
		path: '/browserify.png?copies=' + COPIES,
		mode: 'allow-wrong-content-type'
	}, function (res) {
		var buffers = []
		res.on('end', function () {
			t.ok(reference.equals(Buffer.concat(buffers)), 'contents match')
			t.ok(buffers.length >= MIN_PIECES, 'received in multiple parts')
			t.end()
		})

		res.on('data', function (data) {
			buffers.push(data)
		})
	})
})

test('large binary request without streaming', function (t) {
	http.get({
		path: '/browserify.png?copies=' + COPIES,
		mode: 'default',
	}, function (res) {
		var buffers = []
		res.on('end', function () {
			t.ok(reference.equals(Buffer.concat(buffers)), 'contents match')
			t.end()
		})

		res.on('data', function (data) {
			buffers.push(data)
		})
	})
})