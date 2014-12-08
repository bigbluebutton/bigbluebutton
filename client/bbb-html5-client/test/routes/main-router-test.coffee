require("../setup")

_ = require("lodash")._
request = require("supertest")

TestHelpers = require("../test_helpers")
config = require("../../config")

require("../../app")
app = config.modules.get("App")

describe "MainRouter", ->

  describe "get /", ->

    it "renders the correct view", (done) ->
      TestHelpers.rendersView('/', 'index', done)

    it "returns the title of the application"
    it "returns the list of registered meetings"

  it "get /auth"
  it "post /auth"
  it "post /logout"
  it "get /meetings"
