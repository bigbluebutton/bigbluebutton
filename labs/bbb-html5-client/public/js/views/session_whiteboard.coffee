define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!models/whiteboard_paper',
  'text!templates/session_whiteboard.html',
  'colorwheel'
], ($, _, Backbone, Raphael, globals, WhiteboardPaperModel,
    sessionWhiteboardTemplate) ->

  # The whiteboard components in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionWhiteboardView = Backbone.View.extend

    initialize: ->
      @paper = null

      # Resize the paper when the window is resize to make it always 100%x100%
      resizePaper = => @_setPaperSize()
      $(window).resize(resizePaper)

      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
      else
        globals.events.on "connection:connected", =>
          @_registerEvents()

    # Override the close() method so we can close the sub-views.
    close: ->
      @paper?.unbindEvents()
      Backbone.View.prototype.close.call(@)

    render: ->
      compiledTemplate = _.template(sessionWhiteboardTemplate)
      @$el.html compiledTemplate

      @_createPaper()

    _createPaper: ->
      # have to create the paper here, in the initializer #slide doesn't exist yet
      container = @$("#slide")[0]
      @paper ?= new WhiteboardPaperModel(container)
      @paper.create()

    # Registers listeners for events in the gloval event bus
    _registerEvents: ->

      globals.events.on "whiteboard:paper:all_slides", (urls) =>
        # to make sure the paper will ocuupy all available area
        @_setPaperSize()

    _setPaperSize: () ->
      @paper.changeSize(@$el.width(), @$el.height(), true, false)


   SessionWhiteboardView
