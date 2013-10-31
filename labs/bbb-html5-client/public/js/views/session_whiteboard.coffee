define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!models/whiteboard_paper',
  'cs!views/session_whiteboard_controls',
  'text!templates/session_whiteboard.html',
  'colorwheel'
], ($, _, Backbone, Raphael, globals, WhiteboardPaperModel,
    SessionWhiteboardControlsView, sessionWhiteboardTemplate) ->

  # TODO: this is being used for presentation and whiteboard, maybe they could be separated

  DEFAULT_COLOUR = "#FF0000"
  DEFAULT_THICKNESS = 1

  # The whiteboard components in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionWhiteboardView = Backbone.View.extend
    events:
      "click #colour-view": "_toggleColorPicker"

    initialize: ->
      @paper = null
      @controlsView = new SessionWhiteboardControlsView()

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
      @controlsView.close()
      @paper?.unbindEvents()
      Backbone.View.prototype.close.call(@)

    render: ->
      compiledTemplate = _.template(sessionWhiteboardTemplate)
      @$el.html compiledTemplate

      # subview with whiteboard controls
      @assign(@controlsView, "#slide-controls")

      @colorView = @$("#colour-view")
      @colourViewCtx = @colorView[0].getContext("2d")
      @colourText = @$("#colour-text")
      @thicknessView = @$("#thickness-view")
      @thicknessViewCtx = @thicknessView[0].getContext("2d")
      @$("#thickness-slider").slider
        value: 1
        min: 1
        max: 20
      @$("#thickness-slider").on "slide", (event, ui) =>
        @_drawThicknessView ui.value, @currentColour
      @$("#slide-current-text-area").autosize()

      @_createColourPicker()
      @_createPaper()
      @_drawThicknessView(DEFAULT_THICKNESS, DEFAULT_COLOUR)
      @_drawColourView(DEFAULT_COLOUR)

    _createColourPicker: ->
      unless @colourPicker
        @$("#colour-picker").hide()
        @colourPicker = Raphael.colorwheel(@$("#colour-picker")[0], 75)
        @colourPicker.input(@$("#colour-text")[0])
        @colourPicker.onchange (color) =>
          @_drawThicknessView(null, color.hex)
          @_drawColourView(color.hex)
        @colourPicker.color DEFAULT_COLOUR

    _createPaper: ->
      # have to create the paper here, in the initializer #slide doesn't exist yet
      container = @$("#slide")[0]
      textbox = @$("#slide-current-text-area")[0]
      @paper ?= new WhiteboardPaperModel(container, textbox)
      @paper.create()

    # Registers listeners for events in the gloval event bus
    _registerEvents: ->

      globals.events.on "whiteboard:paper:all_slides", (urls) =>
        @controlsView.clearUploadStatus()
        # to make sure the paper will ocuupy all available area
        @_setPaperSize()

    # Toggles the visibility of the colour picker, which is hidden by
    # default. The picker is a RaphaelJS object, so each node of the object
    # must be shown/hidden individually.
    _toggleColorPicker: ->
      if @$("#colour-picker").is(":visible")
        @$("#colour-picker").hide()
      else
        @$("#colour-picker").show()

      # TODO: to use the event to test other things
      # @controlsView.setUploadStatus "msg", true

    # Drawing the thickness viewer for client feedback.
    # No messages are sent to the server, it is completely
    # local. Shows visual of thickness for drawing tools.
    # @param  {number} thickness the thickness value
    # @param  {string} colour    the colour it should be displayed as
    # @return {undefined}
    _drawThicknessView: (thickness, colour) ->
      @currentThickness = thickness if thickness?
      @thicknessViewCtx.fillStyle = "#FFFFFF"
      @thicknessViewCtx.fillRect 0, 0, 20, 20
      center = Math.round((20 - @currentThickness + 1) / 2)
      @thicknessViewCtx.fillStyle = colour
      @thicknessViewCtx.fillRect center, center, @currentThickness + 1, @currentThickness + 1

    # Drawing the colour viewer for client feedback.
    # No messages are sent to the server, it is
    # completely local. Shows colour visual for drawing tools.
    # @param  {string} colour the colour it should be displayed as
    # @return {undefined}
    _drawColourView: (colour) ->
      @currentColour = colour
      @colourViewCtx.fillStyle = colour
      @colourText.value = colour
      @colourViewCtx.fillRect 0, 0, 12, 12

    _setPaperSize: () ->
      @paper.changeSize(@$el.width(), @$el.height(), true, false)


   SessionWhiteboardView
