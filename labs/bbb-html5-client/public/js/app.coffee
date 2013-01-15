define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!router',
  'cs!models/connection',
  'jquery.mousewheel',
  'jquery.autosize',
  'jquery.form',
  'jquery.ui'
], ($, _, Backbone, Raphael, globals, Router, ConnectionModel) ->

  globals.router = {}
  globals.connection = {}

  initialize = ->
    # Authentication object, set when the user is authorized in
    globals.currentAuth = null

    # Default application router
    globals.router = new Router()

    # Default connection (websocket)
    globals.connection = new ConnectionModel()

    # Start at /login
    globals.router.showLogin()
    Backbone.history.start({silent: true})

  return {
    initialize: initialize
  }
