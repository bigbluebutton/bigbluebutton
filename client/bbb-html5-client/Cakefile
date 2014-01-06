_ = require 'lodash'
fs = require 'fs'
{print} = require 'util'
{spawn, exec} = require 'child_process'
glob = require 'glob'

# Configurations

config = {}
config.binPath = './node_modules/.bin/'


# Cake tasks

# `cake build`
# Builds all assets that are needed to run the application in production.
task 'build', 'Builds what is needed for production', ->
  buildApp()

# `cake docs`
# Builds the documentation files.
task 'docs', 'Generate annotated source code with docco', ->
  serverFilesForDocs (files) ->
    options = ['-n', 'BigBlueButton HTML5 Client', '-o', 'docs/server'].concat(files)
    run 'codo', options
  clientFilesForDocs (files) ->
    options = ['-n', 'BigBlueButton HTML5 Client', '-o', 'docs/client'].concat(files)
    run 'codo', options

# cake test # run all tests
# cake -f test/lib/file.coffee test # run the files passed
# cake -b test # run all tests and stop at first failure
option '-f', '--file [FILE*]', 'input file(s)'
option '-b', '--bail', 'bail'
task 'test', 'Run the test suite', (options) ->
  process.env.NODE_ENV = "test"
  testFiles = [
    'test/factories.coffee'
  ]
  testOpts = [
    '--compilers', 'coffee:coffee-script',
    '--require', 'should',
    '--colors',
    '--ignore-leaks',
    '--timeout', '15000',
    '--reporter', 'spec'
  ]
  if options.bail? and options.bail
    testOpts = testOpts.concat('-b')

  if options.file?
    if _.isArray(options.file)
      files = testFiles.concat(options.file)
    else
      files = testFiles.concat([options.file])
    for opt in testOpts.reverse()
      files.unshift opt
    run 'mocha', files

  else
    glob 'test/**/*.coffee', (error, files) ->
      for opt in testOpts.reverse()
        files.unshift opt
      run 'mocha', files


# Internal methods

# Spawns an application with `options` and calls `onExit`
# when it finishes.
run = (bin, options, onExit) ->
  bin = config.binPath + bin
  console.log timeNow() + ' - running: ' + bin + ' ' + (if options? then options.join(' ') else "")
  cmd = spawn bin, options
  cmd.stdout.on 'data', (data) -> print data.toString()
  cmd.stderr.on 'data', (data) -> print data.toString()
  cmd.on 'exit', (code) ->
    console.log 'done.'
    onExit?(code, options)

# Returns a string with the current time to print out.
timeNow = ->
  today = new Date()
  today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds()

# Runs the command to build the application for use in production.
buildApp = ->
  options = ['-o', 'public/js/build.js']
  run 'r.js', options

# Returns an array with all files from the server that should be used when generating
# the documentation
serverFilesForDocs = (callback) ->
  r = []
  glob '*.coffee', (error, files) ->
    r = r.concat(files)
    glob '*.js', (error, files) ->
      r = r.concat(files)
      glob 'routes/**/*.coffee', (error, files) ->
        r = r.concat(files)
        glob 'lib/**/*.coffee', (error, files) ->
          r = r.concat(files)
          callback(r)

# Returns an array with all files from the client that should be used when generating
# the documentation
clientFilesForDocs = (callback) ->
  glob 'public/**/*.coffee', (error, files) ->
    callback(files)
