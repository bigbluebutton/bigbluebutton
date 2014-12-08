define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session_navbar_hidden.html'
], ($, _, Backbone, globals, sessionNavbarHiddenTemplate) ->

  # The navbar in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the navbar.
  SessionNavbarView = Backbone.View.extend
    events:
      "click #show-menu-btn": "_showMenu"

    initialize: ->
      @$parentEl = null

    render: ->
      compiledTemplate = _.template(sessionNavbarHiddenTemplate)
      @$el.html compiledTemplate

    _showMenu: ->
      @$parentEl.addClass('navbar-on')

  SessionNavbarView
