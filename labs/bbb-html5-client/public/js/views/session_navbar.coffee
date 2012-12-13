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
      "click #chat-btn": "toggleChat"
      "click #users-btn": "toggleUsers"
      "click #logout-btn": "logout"
      "click #prev-slide-btn": "previousSlide"
      "click #next-slide-btn": "nextSlide"
      "click #tool-pan-btn": "toolPan"
      "click #tool-line-btn": "toolLine"
      "click #tool-rect-btn": "toolRect"
      "click #tool-ellipse-btn": "toolEllipse"

    initialize: ->
      @$parentEl = null

    # Ensure the status of the toggle buttons is ok
    setToggleButtonsStatus: ->
      $("#chat-btn", @$el).toggleClass "active", @$parentEl.hasClass("chat-enabled")
      $("#users-btn", @$el).toggleClass "active", @$parentEl.hasClass("users-enabled")

    # don't really need to render anything, the rendering is done by SessionView
    render: ->
      @setToggleButtonsStatus()

    # Toggle the visibility of the chat panel
    toggleChat: ->
      clearTimeout @toggleChatTimeout if @toggleChatTimeout?
      @$parentEl.toggleClass "chat-enabled"
      @setToggleButtonsStatus()
      # TODO
      # @toggleChatTimeout = setTimeout(->
      #   Whiteboard.windowResized()
      # , 510)

    # Toggle the visibility of the users panel
    toggleUsers: ->
      clearTimeout @toggleUsersTimeout if @toggleUsersTimeout?
      @$parentEl.toggleClass "users-enabled"
      @setToggleButtonsStatus()
      # TODO
      # @toggleUsersTimeout = setTimeout(->
      #   Whiteboard.windowResized()
      # , 510)

    # Log out of the session
    logout: ->
      globals.connection.emitLogout()
      globals.currentAuth = null

    # Go to the previous slide
    previousSlide: ->
      globals.connection.emitPreviousSlide()

    # Go to the next slide
    nextSlide: ->
      globals.connection.emitNextSlide()

    # "Pan" tool was clicked
    toolPan: ->
      globals.connection.emitChangeTool("panzoom")

    # "Line" tool was clicked
    toolLine: ->
      globals.connection.emitChangeTool("line")

    # "Rect" tool was clicked
    toolRect: ->
      globals.connection.emitChangeTool("rect")

    # "Ellipse" tool was clicked
    toolEllipse: ->
      globals.connection.emitChangeTool("ellipse")

  SessionNavbarView
