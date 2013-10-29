sinon = require("sinon")

# Setup the default environment for tests

# Prevent tests from ruining development dbs
env = process.env.NODE_ENV ? "development"
unless env is "test"
  console.log "Tests should run using the 'test' environment."
  console.log "Prepend 'NODE_ENV=test' to your command."
  process.exit(1)

config = require("../config")

# Disable the standard output messages
process.env.LOGGER_DISABLED = true # Logger.enabled only won't work

# Creates a default sinon sandbox for all methods that need to stub/mock something.
# This sandbox is automatically restored after each test.
beforeEach (done) ->
  @sinonSandbox = sinon.sandbox.create()
  done()
afterEach (done) ->
  @sinonSandbox.restore()
  done()

# Load factories
require("./factories")
