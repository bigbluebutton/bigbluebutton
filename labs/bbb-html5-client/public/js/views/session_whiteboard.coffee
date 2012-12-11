define [
  'jquery',
  'underscore',
  'backbone',
  'globals',
  'cs!models/whiteboard_paper',
  'text!templates/preupload_image.html'
], ($, _, Backbone, globals, WhiteboardPaperModel, preuploadImageTemplate) ->

  # TODO: this is being used for presentation and whiteboard, maybe they could be separated

  DEFAULT_COLOUR = "#FF0000"
  DEFAULT_THICKNESS = 1

  # The whiteboard components in a session
  # The contents are rendered by SessionView, this class is Used to
  # manage the events in the users.
  SessionWhiteboardView = Backbone.View.extend

    initialize: ->
      @paper = null

      # Bind to the event triggered when the client connects to the server
      globals.connection.bind "connection:connected",
        this.registerConnectionEvents, this

    # Registers listeners for events in the application socket.
    registerConnectionEvents: ->
      socket = globals.connection.socket

      # Received event to update all the slide images
      # @param  {Array} urls list of URLs to be added to the paper (after old images are removed)
      socket.on "all_slides", (urls) =>
        console.log "received all_slides", urls
        # TODO $("#uploadStatus").text ""
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

    # don't need to render anything, the rendering is done by SessionView.
    render: ->
      @colorView = @$("#colourView")
      @colourViewCtx = @colorView[0].getContext("2d")
      @colourText = @$("#colourText")
      @thicknessControl = @$("#thicknessView")
      @thicknessControlCtx = @thicknessControl[0].getContext("2d")

      @_renderPaper()

      @_drawThicknessView(DEFAULT_THICKNESS, DEFAULT_COLOUR)
      @_drawColourView(DEFAULT_COLOUR)

    _renderPaper: ->
      # have to create the paper here, in the initializer #slide doesn't exist yet
      $slide = @$("#slide")
      # TODO: at this point the dimensions of $slide are 0
      @paper ?= new WhiteboardPaperModel($slide[0], $slide.innerWidth(), $slide.innerHeight())
      @paper.create()

      # events triggered when an image is added or removed from the paper
      @paper.bind "paper:image:added", @addPreloadImage, this
      @paper.bind "paper:image:removed", @removePreloadImage, this

    addPreloadImage: (img) ->
      customSrc = img.attr("src")
      customSrc = customSrc.replace(":3000", "") # TODO: temporary
      console.log "adding preload image", customSrc
      data =
        img:
          id: img.id
          url: customSrc
      compiledTemplate = _.template(preuploadImageTemplate, data)
      @$("#slide").append compiledTemplate

    removePreloadImage: (imgID) ->
      console.log "removing preload image", imgID
      $("#preload-" + imgID).remove()

    # Drawing the thickness viewer for client feedback.
    # No messages are sent to the server, it is completely
    # local. Shows visual of thickness for drawing tools.
    # @param  {number} thickness the thickness value
    # @param  {string} colour    the colour it should be displayed as
    # @return {undefined}
    _drawThicknessView: (thickness, colour) ->
      @currentThickness = thickness
      @thicknessControlCtx.fillStyle = "#FFFFFF"
      @thicknessControlCtx.fillRect 0, 0, 20, 20
      center = Math.round((20 - thickness + 1) / 2)
      @thicknessControlCtx.fillStyle = colour
      @thicknessControlCtx.fillRect center, center, thickness + 1, thickness + 1

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
