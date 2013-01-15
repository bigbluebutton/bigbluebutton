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

    showLogin: () ->
      globals.router.navigate "/login", {replace: true}
      @loginView ?= new LoginView()
      @appView.render(@loginView)

    showSession: () ->
      globals.router.navigate "/session", {replace: true}
      @sessionView ?= new SessionView()
      @appView.render(@sessionView)

  Router
