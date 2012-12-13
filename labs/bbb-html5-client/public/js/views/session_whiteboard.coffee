define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!models/whiteboard_paper',
  'text!templates/preupload_image.html',
  'cs!views/session_whiteboard_controls',
  'colorwheel'
], ($, _, Backbone, Raphael, globals, WhiteboardPaperModel,
    preuploadImageTemplate, SessionWhiteboardControlsView) ->

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

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        @_registerConnectionEvents, @

    # Override the close() method so we can close the sub-views.
    close: ->
      @controlsView.close()
      Backbone.View.prototype.close.call(@)

    # don't need to render anything, the rendering is done by SessionView.
    render: ->
      @assign(@controlsView, "#slide-controls")

      @colorView = @$("#colour-view")
      @colourViewCtx = @colorView[0].getContext("2d")
      @colourText = @$("#colour-text")
      @thicknessControl = @$("#thickness-view")
      @thicknessControlCtx = @thicknessControl[0].getContext("2d")
      @_createColourPicker()

      @_renderPaper()

      @_drawThicknessView(DEFAULT_THICKNESS, DEFAULT_COLOUR)
      @_drawColourView(DEFAULT_COLOUR)

      @

    _createColourPicker: ->
      unless @colourPicker
        @$("#colour-picker").hide()
        @colourPicker = Raphael.colorwheel(@$("#colour-picker")[0], 75)
        @colourPicker.input(@$("#colour-text")[0])
        @colourPicker.onchange (color) =>
          @_drawThicknessView(null, color.hex)
          @_drawColourView(color.hex)
        @colourPicker.color DEFAULT_COLOUR

    # Registers listeners for events in the application socket.
    _registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event to update all the slide images
      # @param  {Array} urls list of URLs to be added to the paper (after old images are removed)
      socket.on "all_slides", (urls) =>
        console.log "received all_slides", urls
        @controlsView.clearUploadStatus()
        @paper?.removeAllImagesFromPaper()
        for url in urls
          @paper?.addImageToPaper(url[0], url[1], url[2])

      # Received event to clear the whiteboard shapes
      socket.on "clrPaper", =>
        console.log "received clrPaper"
        @paper?.clear()

      # Received event to update all the shapes in the whiteboard
      # @param  {Array} shapes Array of shapes to be drawn
      socket.on "all_shapes", (shapes) =>
        console.log "received all_shapes"
        @paper?.clear()
        @paper?.drawListOfShapes shapes

      # Received event to update a shape being created
      # @param  {string} shape type of shape being updated
      # @param  {Array} data   all information to update the shape
      socket.on "updShape", (shape, data) =>
        @paper?.updateShape shape, data

      # Received event to create a shape on the whiteboard
      # @param  {string} shape type of shape being made
      # @param  {Array} data   all information to make the shape
      socket.on "makeShape", (shape, data) =>
        @paper?.makeShape shape, data

      # Received event to update the cursor coordinates
      # @param  {number} x x-coord of the cursor as a percentage of page width
      # @param  {number} y y-coord of the cursor as a percentage of page height
      socket.on "mvCur", (x, y) =>
        @paper?.moveCursor x, y

      # Received event to update the slide image
      # @param  {string} url URL of image to show
      socket.on "changeslide", (url) =>
        console.log "received changeslide", url
        @paper?.showImageFromPaper url

      # Received event to update the viewBox value
      # @param  {string} xperc Percentage of x-offset from top left corner
      # @param  {string} yperc Percentage of y-offset from top left corner
      # @param  {string} wperc Percentage of full width of image to be displayed
      # @param  {string} hperc Percentage of full height of image to be displayed
      # TODO: not tested yet
      socket.on "viewBox", (xperc, yperc, wperc, hperc) =>
        console.log "received viewBox", xperc, yperc, wperc, hperc
        xperc = parseFloat(xperc, 10)
        yperc = parseFloat(yperc, 10)
        wperc = parseFloat(wperc, 10)
        hperc = parseFloat(hperc, 10)
        @paper?.updatePaperFromServer xperc, yperc, wperc, hperc

      # Received event to update the whiteboard between fit to width and fit to page
      # @param  {boolean} value choice of fit: true for fit to page, false for fit to width
      socket.on "fitToPage", (value) ->
        @paper?.setFitToPage value

      # Received event to update the zoom level of the whiteboard.
      # @param  {number} delta amount of change in scroll wheel
      socket.on "zoom", (delta) ->
        @paper?.setZoom delta

      # Received event to update the whiteboard size and position
      # @param  {number} cx x-offset from top left corner as percentage of original width of paper
      # @param  {number} cy y-offset from top left corner as percentage of original height of paper
      # @param  {number} sw slide width as percentage of original width of paper
      # @param  {number} sh slide height as a percentage of original height of paper
      socket.on "paper", (cx, cy, sw, sh) ->
        @paper?.updatePaperFromServer cx, cy, sw, sh

      # Received event when the panning action finishes
      socket.on "panStop", ->
        # TODO: implement
        # @paper?.panDone()

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

    _renderPaper: ->
      # have to create the paper here, in the initializer #slide doesn't exist yet
      @paper ?= new WhiteboardPaperModel(@$("#slide")[0])
      @paper.create()

      # events triggered when an image is added or removed from the paper
      @paper.bind "paper:image:added", @_addPreloadImage, this
      @paper.bind "paper:image:removed", @_removePreloadImage, this

    _addPreloadImage: (img) ->
      customSrc = img.attr("src")
      customSrc = customSrc.replace(":3000", "") # TODO: temporary
      console.log "adding preload image", customSrc
      data =
        img:
          id: img.id
          url: customSrc
      compiledTemplate = _.template(preuploadImageTemplate, data)
      @$("#slide").append compiledTemplate

    _removePreloadImage: (imgID) ->
      console.log "removing preload image", imgID
      $("#preload-" + imgID).remove()

    # Drawing the thickness viewer for client feedback.
    # No messages are sent to the server, it is completely
    # local. Shows visual of thickness for drawing tools.
    # @param  {number} thickness the thickness value
    # @param  {string} colour    the colour it should be displayed as
    # @return {undefined}
    _drawThicknessView: (thickness, colour) ->
      @currentThickness = thickness if thickness?
      @thicknessControlCtx.fillStyle = "#FFFFFF"
      @thicknessControlCtx.fillRect 0, 0, 20, 20
      center = Math.round((20 - @currentThickness + 1) / 2)
      @thicknessControlCtx.fillStyle = colour
      @thicknessControlCtx.fillRect center, center, @currentThickness + 1, @currentThickness + 1

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

   SessionWhiteboardView
