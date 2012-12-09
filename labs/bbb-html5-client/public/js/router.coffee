define [
  'jquery',
  'underscore',
  'backbone',
  'cs!views/app',
  'cs!views/login',
  'cs!views/session'
], ($, _, Backbone, AppView, LoginView, SessionView) ->

  Router = Backbone.Router.extend
    routes:
      'session': 'showSession',
      'login': 'showLogin',
      '*actions': 'defaultAction'

    initialize: ->
      @appView = new AppView()

    defaultAction: (actions) ->
      console.log "router action:", actions

    showLogin: () ->
      loginView = new LoginView()
      @appView.render(loginView)

    showSession: () ->
      sessionView = new SessionView()
      @appView.render(sessionView)

  Router
