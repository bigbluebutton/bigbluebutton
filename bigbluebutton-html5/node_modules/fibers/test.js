#!/usr/bin/env node
var fs = require('fs');
var spawn = require('child_process').spawn;
var path = require('path');

var ret = 0;
function runTest(test, cb) {
	var env = {};
	for (var ii in process.env) {
		env[ii] = process.env[ii];
	}
	env.NODE_PATH = __dirname;
	var args = [];
	if (process.versions.modules >= 57 && process.versions.modules < 59) {
		// Node v8 requires forcing async hook checks. In Node v9 (>=59) and beyond,
		// async hooks checks are on by default (and the param no longer exists).
		args.push('--force-async-hooks-checks');
	}
	args.push(path.join('test', test));
	var proc = spawn(process.execPath, args, { env: env });
	proc.stdout.setEncoding('utf8');
	proc.stderr.setEncoding('utf8');

	var stdout = '', stderr = '';
	proc.stdout.on('data', function(data) {
		stdout += data;
	});
	proc.stderr.on('data', function(data) {
		stderr += data;
	});
	proc.stdin.end();

	proc.on('exit', function(code) {
		if (stdout !== 'pass\n' || stderr !== '') {
			ret = 1;
			console.error(
				test+ ': *fail*\n'+
				'code: '+ code+ '\n'+
				'stderr: '+ stderr+ '\n'+
				'stdout: '+ stdout
			);
		} else if (code !== 0) {
			ret = 1;
			console.error(test+ ': fail ('+ code+ ')');
		} else {
			console.log(test+ ': '+ 'pass');
		}
		cb();
	});
}

var cb = function() {
	process.exit(ret);
};
fs.readdirSync('./test').reverse().forEach(function(file) {
	cb = new function(cb) {
		return function(err) {
			if (err) return cb(err);
			runTest(file, cb);
		};
	}(cb);
});
cb();
