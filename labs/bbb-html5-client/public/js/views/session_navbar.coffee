define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'text!templates/session_navbar.html'
], ($, _, Backbone, globals, sessionNavbarTemplate) ->

  # The navbar in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the navbar.
  # @todo it triggers window.resize() in several methods so the svg inside the presentation is
  #   redraw properly, but this should be more dynamic in the future
  SessionNavbarView = Backbone.View.extend
    events:
      "click #hide-menu-btn": "_hideMenu"
      "click #users-btn": "_toggleUsers"
      "click #chat-btn": "_toggleChat"
      "click #video-btn": "_toggleVideo"
      "click #audio-btn": "_toggleAudio"
      "click #logout-btn": "_logout"

    initialize: ->
      @$parentEl = null

    render: ->
      compiledTemplate = _.template(sessionNavbarTemplate)
      @$el.html compiledTemplate
      @_setToggleButtonsStatus()

    # Ensure the status of the toggle buttons is ok
    _setToggleButtonsStatus: ->
      $("#chat-btn", @$el).toggleClass "active", @$parentEl.hasClass("chat-on")
      $("#users-btn", @$el).toggleClass "active", @$parentEl.hasClass("users-on")
      $("#video-btn", @$el).toggleClass "active", @$parentEl.hasClass("video-on")
      $("#audio-btn", @$el).toggleClass "active", @$parentEl.hasClass("audio-on")

    # Toggle the visibility of the chat panel
    _toggleChat: ->
      @$parentEl.toggleClass('chat-on')
      @_setToggleButtonsStatus()
      $(window).resize()

    # Toggle the visibility of the users panel
    _toggleUsers: ->
      @$parentEl.toggleClass('users-on')
      @_setToggleButtonsStatus()

    _toggleVideo: ->
      @$parentEl.toggleClass('video-on')
      @_setToggleButtonsStatus()
      $(window).resize()

    _toggleAudio: ->
      @$parentEl.toggleClass('audio-on')
      @_setToggleButtonsStatus()

    _hideMenu: ->
      @$parentEl.removeClass('navbar-on')
      @_setToggleButtonsStatus()
      $(window).resize()

    # Log out of the session
    _logout: ->
      globals.connection.emitLogout()
      globals.currentAuth = null

  SessionNavbarView
