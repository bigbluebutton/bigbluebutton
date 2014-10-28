http = require("http")
request = require("supertest")
sinon = require("sinon")

config = require("../config")

# Test Helpers
# Class with helper methods to be used in tests.
exports = module.exports = class TestHelpers
  constructor: () ->

  # Verifies that a request to `route` will render the view `viewPath` (e.g. "plans/index")
  @rendersView = (route, viewPath, done) ->
    app = TestHelpers.getApp()
    spy = sinon.spy(http.ServerResponse.prototype, "render")
    request(app)
      .get(route)
      .expect("Content-Type", /text\/html/)
      .end (err, res) ->
        spy.called.should.be.true
        spy.firstCall.calledWith(viewPath).should.be.true
        spy.restore()
        done()

  # Gets the default application to be used in the tests. If not set by the user, will
  # get the `app` module registered in `config`.
  @getApp = ->
    TestHelpers.app ||= config.modules.get("App")
