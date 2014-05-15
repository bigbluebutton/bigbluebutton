define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!views/app',
  'cs!views/login',
  'cs!views/session'
], ($, _, Backbone, globals, AppView, LoginView, SessionView) ->

  Router = Backbone.Router.extend
    routes:
      'session': 'showSession',
      'login': 'showLogin',

      # '*actions': 'defaultAction'

    initialize: ->
      @appView = new AppView()

    showLogin: () ->#TEMP I want to show the session window right away
      globals.router.navigate "/login", {replace: true}
      @sessionView ?= new SessionView()#TEMP I want to show the session window right away
      @appView.render(@sessionView)#TEMP I want to show the session window right away

    showSession: () ->
      globals.router.navigate "/session", {replace: true}
      @sessionView ?= new SessionView()
      @appView.render(@sessionView)

  Router
