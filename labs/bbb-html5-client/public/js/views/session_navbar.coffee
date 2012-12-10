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
      "click #chat-btn": "toogleChat"
      "click #users-btn": "toogleUsers"
      "click #logout-btn": "logout"
      "click #prev-slide-btn": "previousSlide"
      "click #next-slide-btn": "nextSlide"
      "click #tool-pan-btn": "toolPan"
      "click #tool-line-btn": "toolLine"
      "click #tool-rect-btn": "toolRect"
      "click #tool-ellipse-btn": "toolEllipse"

    initialize: ->
      @$parentEl = null

    # Ensure the status of the toogle buttons is ok
    setToogleButtonsStatus: ->
      $("#chat-btn", @$el).toggleClass "active", @$parentEl.hasClass("chat-enabled")
      $("#users-btn", @$el).toggleClass "active", @$parentEl.hasClass("users-enabled")

    render: ->
      # don't really need to render anything, the rendering is done by
      # SessionView, so we just update the status of some buttons
      @setToogleButtonsStatus()

    # Toogle the visibility of the chat panel
    toogleChat: ->
      clearTimeout @toogleChatTimeout if @toogleChatTimeout?
      @$parentEl.toggleClass "chat-enabled"
      @setToogleButtonsStatus()
      # TODO
      # @toogleChatTimeout = setTimeout(->
      #   Whiteboard.windowResized()
      # , 510)

    # Toogle the visibility of the users panel
    toogleUsers: ->
      clearTimeout @toogleUsersTimeout if @toogleUsersTimeout?
      @$parentEl.toggleClass "users-enabled"
      @setToogleButtonsStatus()
      # TODO
      # @toogleUsersTimeout = setTimeout(->
      #   Whiteboard.windowResized()
      # , 510)

    # Log out of the session
    logout: ->
      globals.connection.emitLogout()

    # Go to the previous slide
    previousSlide: ->
      globals.connection.emitPrevSlide()

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
