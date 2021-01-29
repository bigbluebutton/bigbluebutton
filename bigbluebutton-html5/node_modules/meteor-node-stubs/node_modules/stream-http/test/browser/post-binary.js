var Buffer = require('buffer').Buffer
var fs = require('fs')
var test = require('tape')
var UAParser = require('ua-parser-js')

var http = require('../..')

var reference = fs.readFileSync(__dirname + '/../server/static/browserify.png')

test('post binary', function (t) {
	var req = http.request({
		path: '/echo',
		method: 'POST'
	}, function (res) {
		var buffers = []

		res.on('end', function () {
			t.ok(reference.equals(Buffer.concat(buffers)), 'echoed contents match')
			t.end()
		})

		res.on('data', function (data) {
			buffers.push(data)
		})
	})

	req.write(reference)
	req.end()
})