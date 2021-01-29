async = require 'async'
{spawn, exec} = require 'child_process'
fs = require 'fs'
glob = require 'glob'
log = console.log
path = require 'path'
remove = require 'remove'

# Node 0.6 compatibility hack.
unless fs.existsSync
  fs.existsSync = (filePath) -> path.existsSync filePath


task 'build', ->
  build()

task 'test', ->
  vendor ->
    build ->
      ssl_cert ->
        test_cases = glob.sync 'test/js/**/*_test.js'
        test_cases.sort()  # Consistent test case order.
        run 'node_modules/.bin/mocha --colors --slow 200 --timeout 1000 ' +
            "--require test/js/helpers/setup.js #{test_cases.join(' ')}"

task 'webtest', ->
  vendor ->
    build ->
      ssl_cert ->
        webtest()

task 'cert', ->
  remove.removeSync 'test/ssl', ignoreMissing: true
  ssl_cert()

task 'vendor', ->
  remove.removeSync './test/vendor', ignoreMissing: true
  vendor()

task 'doc', ->
  run 'node_modules/.bin/codo --title "node-xhr API Documentation" src'

build = (callback) ->
  commands = []

  # Ignoring ".coffee" when sorting.
  # We want "driver.coffee" to sort before "driver-browser.coffee"
  source_files = glob.sync 'src/**/*.coffee'
  source_files.sort (a, b) ->
    a.replace(/\.coffee$/, '').localeCompare b.replace(/\.coffee$/, '')

  # Compile without --join for decent error messages.
  commands.push 'node_modules/.bin/coffee --output tmp --compile ' +
                source_files.join(' ')
  commands.push 'node_modules/.bin/coffee --output lib --compile ' +
                "--join xhr2.js #{source_files.join(' ')}"

  # Tests are supposed to be independent, so the build order doesn't matter.
  test_dirs = glob.sync 'test/src/**/'
  for test_dir in test_dirs
    out_dir = test_dir.replace(/^test\/src\//, 'test/js/')
    test_files = glob.sync path.join(test_dir, '*.coffee')
    commands.push "node_modules/.bin/coffee --output #{out_dir} " +
                  "--compile #{test_files.join(' ')}"

  async.forEachSeries commands, run, ->
    # Build the binary test image.
    buffer = fs.readFileSync 'test/fixtures/xhr2.png'
    bytes = (buffer.readUInt8(i) for i in [0...buffer.length])
    globalJs = '((function(){ return this.global || this; })())'
    js = "#{globalJs}.xhr2PngBytes = #{JSON.stringify(bytes)};"
    fs.writeFile 'test/js/helpers/xhr2.png.js', js, ->
      callback() if callback

webtest = (callback) ->
  xhrServer = require './test/js/helpers/xhr_server.js'
  if 'BROWSER' of process.env
    if process.env['BROWSER'] is 'false'
      url = xhrServer.https.testUrl()
      console.log "Please open the URL below in your browser:\n    #{url}"
    else
      xhrServer.https.openBrowser process.env['BROWSER']
  else
    xhrServer.https.openBrowser()
  callback() if callback?

ssl_cert = (callback) ->
  if fs.existsSync 'test/ssl/cert.pem'
    callback() if callback?
    return

  fs.mkdirSync 'test/ssl' unless fs.existsSync 'test/ssl'
  run 'openssl req -new -x509 -days 365 -nodes -sha256 -newkey rsa:2048 ' +
      '-batch -out test/ssl/cert.pem -keyout test/ssl/cert.pem ' +
      '-subj /O=xhr2.js/OU=Testing/CN=localhost ', callback

vendor = (callback) ->
  # All the files will be dumped here.
  fs.mkdirSync 'test/vendor' unless fs.existsSync 'test/vendor'

  downloads = [
    # chai.js ships different builds for browsers vs node.js
    ['https://www.chaijs.com/chai.js', 'test/vendor/chai.js'],
    # sinon.js also ships special builds for browsers
    ['https://sinonjs.org/releases/sinon.js', 'test/vendor/sinon.js'],
  ]
  async.forEachSeries downloads, download, ->
    callback() if callback

run = (args...) ->
  for a in args
    switch typeof a
      when 'string' then command = a
      when 'object'
        if a instanceof Array then params = a
        else options = a
      when 'function' then callback = a

  command += ' ' + params.join ' ' if params?
  cmd = spawn '/bin/sh', ['-c', command], options
  cmd.stdout.on 'data', (data) -> process.stdout.write data
  cmd.stderr.on 'data', (data) -> process.stderr.write data
  process.on 'SIGHUP', -> cmd.kill()
  cmd.on 'exit', (code) -> callback() if callback? and code is 0

download = ([url, file], callback) ->
  if fs.existsSync file
    callback() if callback?
    return

  run "curl -o #{file} #{url}", callback
