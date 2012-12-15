define [
  'jquery',
  'underscore',
  'backbone',
  'globals'
], ($, _, Backbone, globals) ->

  # The navbar in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the navbar.
  SessionNavbarView = Backbone.View.extend
    events:
      "click #chat-btn": "_toggleChat"
      "click #users-btn": "_toggleUsers"
      "click #logout-btn": "_logout"
      "click #prev-slide-btn": "_previousSlide"
      "click #next-slide-btn": "_nextSlide"
      "click #tool-pan-btn": "_toolPan"
      "click #tool-line-btn": "_toolLine"
      "click #tool-rect-btn": "_toolRect"
      "click #tool-ellipse-btn": "_toolEllipse"

    initialize: ->
      @$parentEl = null

    # don't really need to render anything, the rendering is done by SessionView
    render: ->
      @_setToggleButtonsStatus()

    # Ensure the status of the toggle buttons is ok
    _setToggleButtonsStatus: ->
      $("#chat-btn", @$el).toggleClass "active", @$parentEl.hasClass("chat-enabled")
      $("#users-btn", @$el).toggleClass "active", @$parentEl.hasClass("users-enabled")

    # Toggle the visibility of the chat panel
    _toggleChat: ->
      clearTimeout @toggleChatTimeout if @toggleChatTimeout?
      @$parentEl.toggleClass "chat-enabled"
      @_setToggleButtonsStatus()
      # TODO
      # @toggleChatTimeout = setTimeout(->
      #   Whiteboard.windowResized()
      # , 510)

    # Toggle the visibility of the users panel
    _toggleUsers: ->
      clearTimeout @toggleUsersTimeout if @toggleUsersTimeout?
      @$parentEl.toggleClass "users-enabled"
      @_setToggleButtonsStatus()
      # TODO
      # @toggleUsersTimeout = setTimeout(->
      #   Whiteboard.windowResized()
      # , 510)

    # Log out of the session
    _logout: ->
      globals.connection.emitLogout()
      globals.currentAuth = null

    # Go to the previous slide
    _previousSlide: ->
      globals.connection.emitPreviousSlide()

    # Go to the next slide
    _nextSlide: ->
      globals.connection.emitNextSlide()

    # "Pan" tool was clicked
    _toolPan: ->
      globals.connection.emitChangeTool("panzoom")

    # "Line" tool was clicked
    _toolLine: ->
      globals.connection.emitChangeTool("line")

    # "Rect" tool was clicked
    _toolRect: ->
      globals.connection.emitChangeTool("rect")

    # "Ellipse" tool was clicked
    _toolEllipse: ->
      globals.connection.emitChangeTool("ellipse")

  SessionNavbarView
