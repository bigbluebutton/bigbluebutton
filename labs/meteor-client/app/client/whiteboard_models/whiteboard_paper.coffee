# "Paper" which is the Raphael term for the entire SVG object on the webpage.
# This class deals with this SVG component only.
class Meteor.WhiteboardPaperModel

  # Container must be a DOM element
  constructor: (@container) ->
    # a WhiteboardCursorModel
    @cursor = null

    # all slides in the presentation indexed by url
    @slides = {}

    @panX = null
    @panY = null

    @current = {}

    # the slide being shown
    @current.slide = null

    # a raphaeljs set with all the shapes in the current slide
    @current.shapes = null
    # a list of shapes as passed to this client when it receives `all_slides`
    # (se we are able to redraw the shapes whenever needed)
    @current.shapeDefinitions = []

    @zoomLevel = 1
    @shiftPressed = false
    @currentPathCount = 0

    @_updateContainerDimensions()

    @zoomObserver = null

    @adjustedWidth = 0
    @adjustedHeight = 0

    @widthRatio = 100
    @heightRatio = 100

  # Initializes the paper in the page.
  # Can't do these things in initialize() because by then some elements
  # are not yet created in the page.
  create: ->
    # paper is embedded within the div#slide of the page.
    # @raphaelObj ?= ScaleRaphael(@container, "900", "500")

    h = $("#"+@container).height()
    w = $("#"+@container).width()

    @raphaelObj ?= ScaleRaphael(@container, w, h)
    @raphaelObj ?= ScaleRaphael(@container, $container.innerHeight(), $container.innerWidth())

    @raphaelObj.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"

    @createCursor()

    if @slides
      @rebuild()
    else
      @slides = {} # if previously loaded
    unless navigator.userAgent.indexOf("Firefox") is -1
      @raphaelObj.renderfix()

    @raphaelObj

  # Re-add the images to the paper that are found
  # in the slides array (an object of urls and dimensions).
  rebuild: ->
    @current.slide = null
    for url of @slides
      if @slides.hasOwnProperty(url)
        @addImageToPaper url, @slides[url].getWidth(), @slides[url].getHeight()

  scale: (width, height) ->
    @raphaelObj?.changeSize(width, height)

  # Add an image to the paper.
  # @param {string} url the URL of the image to add to the paper
  # @param {number} width   the width of the image (in pixels)
  # @param {number} height   the height of the image (in pixels)
  # @return {Raphael.image} the image object added to the whiteboard
  addImageToPaper: (url, width, height) ->
    @_updateContainerDimensions()

    # solve for the ratio of what length is going to fit more than the other
    max = Math.max(width / @containerWidth, height / @containerHeight)
    # fit it all in appropriately
    url = @_slideUrl(url)
    sw = width / max
    sh = height / max
    #cx = (@containerWidth / 2) - (width / 2)
    #cy = (@containerHeight / 2) - (height / 2)
    img = @raphaelObj.image(url, cx = 0, cy = 0, width, height)

    # sw slide width as percentage of original width of paper
    # sh slide height as a percentage of original height of paper
    # x-offset from top left corner as percentage of original width of paper
    # y-offset from top left corner as percentage of original height of paper
    @slides[url] = new WhiteboardSlideModel(img.id, url, img, width, height, sw, sh, cx, cy)

    unless @current.slide?
      img.toBack()
      @current.slide = @slides[url]
    else if @current.slide.url is url
      img.toBack()
    else
      img.hide()

    # TODO: other places might also required an update in these dimensions
    @_updateContainerDimensions()

    @_updateZoomRatios()
    @cursor.setRadius(6 * @widthRatio / 100)

    img

  # Removes all the images from the Raphael paper.
  removeAllImagesFromPaper: ->
    for url of @slides
      if @slides.hasOwnProperty(url)
        @raphaelObj.getById(@slides[url]?.getId())?.remove()
        #@trigger('paper:image:removed', @slides[url].getId()) # Removes the previous image preventing images from being redrawn over each other repeatedly
    @slides = {}
    @current.slide = null


  # Switches the tool and thus the functions that get
  # called when certain events are fired from Raphael.
  # @param  {string} tool the tool to turn on
  # @return {undefined}
  setCurrentTool: (tool) ->
    @currentTool = tool
    console.log "setting current tool to", tool
    switch tool
      when "line"
        @cursor.undrag()
        @current.line = @_createTool(tool)
        @cursor.drag(@current.line.dragOnMove, @current.line.dragOnStart, @current.line.dragOnEnd)
      when "rectangle"
        @cursor.undrag()
        @current.rectangle = @_createTool(tool)
        @cursor.drag(@current.rectangle.dragOnMove, @current.rectangle.dragOnStart, @current.rectangle.dragOnEnd)
      else
        console.log "ERROR: Cannot set invalid tool:", tool

  # Clear all shapes from this paper.
  clearShapes: ->
    if @current.shapes?
      @current.shapes.forEach (element) ->
        element.remove()
      @currentShapes = []
      @currentShapesDefinitions = []
    @clearCursor()
    @createCursor()

  clearCursor: ->
    @cursor?.remove()

  createCursor: ->
    @cursor = new WhiteboardCursorModel(@raphaelObj)
    @cursor.setRadius(6 * @widthRatio / 100)
    @cursor.draw()

  # Updated a shape `shape` with the data in `data`.
  # TODO: check if the objects exist before calling update, if they don't they should be created
  updateShape: (shape, data) ->
    @current[shape].update(data)

  # Make a shape `shape` with the data in `data`.
  makeShape: (shape, data) ->
    data.thickness *= @adjustedWidth / 1000

    tool = null

    @current[shape] = @_createTool(shape)
    toolModel = @current[shape]
    tool = @current[shape].make(data)

    if tool?
      @current.shapes ?= @raphaelObj.set()
      @current.shapes.push(tool)
      @current.shapeDefinitions.push(toolModel.getDefinition())

  # Update the cursor position on screen
  # @param  {number} x the x value of the cursor as a percentage of the width
  # @param  {number} y the y value of the cursor as a percentage of the height
  moveCursor: (x, y) ->
    [cx, cy] = @_currentSlideOffsets()
    [slideWidth, slideHeight] = @_currentSlideOriginalDimensions()
    @cursor.setPosition(x * slideWidth + cx, y * slideHeight + cy)

    #if the slide is zoomed in then move the cursor based on where the viewBox is looking
    if @viewBoxXpos? && @viewBoxYPos?  && @viewBoxWidth? && @viewBoxHeight?
      @cursor.setPosition( @viewBoxXpos + x * @viewBoxWidth, @viewBoxYPos + y * @viewBoxHeight )

  zoomAndPan: (widthRatio, heightRatio, xOffset, yOffset) ->
    console.log "zoomAndPan #{widthRatio} #{heightRatio} #{xOffset} #{yOffset}"
    newX = - xOffset * 2 * @adjustedWidth / 100
    newY = - yOffset * 2 * @adjustedHeight / 100
    newWidth = @adjustedWidth * widthRatio / 100
    newHeight = @adjustedHeight * heightRatio / 100
    @raphaelObj.setViewBox(newX, newY, newWidth, newHeight) # zooms and pans

  setAdjustedDimensions: (width, height) ->
    @adjustedWidth = width
    @adjustedHeight = height

  # Update the dimensions of the container.
  _updateContainerDimensions: ->
    #console.log "update Container Dimensions"

    $container = $('#whiteboard-paper')
    @containerWidth = $container.innerWidth()
    @containerHeight = $container.innerHeight()

    @containerOffsetLeft = $container.offset()?.left
    @containerOffsetTop = $container.offset()?.top

  _updateZoomRatios: ->
    currentSlideDoc = getCurrentSlideDoc()
    @widthRatio = currentSlideDoc.slide.width_ratio
    @heightRatio = currentSlideDoc.slide.height_ratio

  # Retrieves an image element from the paper.
  # The url must be in the slides array.
  # @param  {string} url        the url of the image (must be in slides array)
  # @return {Raphael.image}     return the image or null if not found
  _getImageFromPaper: (url) ->
    if @slides[url]
      id = @slides[url].getId()
      return @raphaelObj.getById(id) if id?
    null

  _currentSlideDimensions: ->
    if @current.slide? then @current.slide.getDimensions() else [0, 0]

  _currentSlideOriginalDimensions: ->
    if @current.slide? then @current.slide.getOriginalDimensions() else [0, 0]

  _currentSlideOffsets: ->
    if @current.slide? then @current.slide.getOffsets() else [0, 0]

  # Wrapper method to create a tool for the whiteboard
  _createTool: (type) ->
    switch type
      when "pencil"
        model = WhiteboardLineModel
      when "path", "line"
        model = WhiteboardLineModel
      when "rectangle"
        model = WhiteboardRectModel
      when "ellipse"
        model = WhiteboardEllipseModel
      when "triangle"
        model = WhiteboardTriangleModel
      when "text"
        model = WhiteboardTextModel

    if model?
      [slideWidth, slideHeight] = @_currentSlideOriginalDimensions()
      [xOffset, yOffset] = @_currentSlideOffsets()
      [width, height] = @_currentSlideDimensions()

      tool = new model(@raphaelObj)
      # TODO: why are the parameters inverted and it works?
      tool.setPaperSize(slideHeight, slideWidth)
      tool.setOffsets(xOffset, yOffset)
      tool.setPaperDimensions(width,height)
      tool
    else
      null

  # Adds the base url (the protocol+server part) to `url` if needed.
  _slideUrl: (url) ->
    if url?.match(/http[s]?:/)
      url
    else
      console.log "The url '#{url}'' did not match the expected format of: http/s"
      #globals.presentationServer + url

  #Changes the currently displayed page/slide (if any) with this one
  #@param {data} message object containing the "presentation" object
  _displayPage: (data, originalWidth, originalHeight) ->
    @removeAllImagesFromPaper()

    @_updateContainerDimensions()
    boardWidth = @containerWidth
    boardHeight = @containerHeight

    currentSlide = getCurrentSlideDoc()

    # TODO currentSlide undefined in some cases - will check later why
    imageWidth = boardWidth * (currentSlide?.slide.width_ratio/100) or boardWidth
    imageHeight = boardHeight * (currentSlide?.slide.height_ratio/100) or boardHeight

    # console.log "xBegin: #{xBegin}"
    # console.log "xEnd: #{xEnd}"
    # console.log "yBegin: #{yBegin}"
    # console.log "yEnd: #{yEnd}"
    # console.log "boardWidth: #{boardWidth}"
    # console.log "boardHeight: #{boardHeight}"
    #console.log "imageWidth: #{imageWidth}"
    #console.log "imageHeight: #{imageHeight}"

    currentPresentation = Meteor.Presentations.findOne({"presentation.current": true})
    presentationId = currentPresentation?.presentation?.id
    currentSlideCursor = Meteor.Slides.find({"presentationId": presentationId, "slide.current": true})

    if @zoomObserver isnt null
      @zoomObserver.stop()
    _this = this
    @zoomObserver = currentSlideCursor.observe # watching the current slide changes
      changed: (newDoc, oldDoc) ->
        if originalWidth <= originalHeight
          @adjustedWidth = boardHeight * originalWidth / originalHeight
          @adjustedHeight = boardHeight
        else
          @adjustedHeight = boardWidth * originalHeight / originalWidth
          @adjustedWidth = boardWidth

        _this.zoomAndPan(newDoc.slide.width_ratio, newDoc.slide.height_ratio,
          newDoc.slide.x_offset, newDoc.slide.y_offset)

        oldRatio = (oldDoc.slide.width_ratio + oldDoc.slide.height_ratio) / 2
        newRatio = (newDoc.slide.width_ratio + newDoc.slide.height_ratio) / 2

        _this?.current?.shapes?.forEach (shape) ->
          shape.attr "stroke-width", shape.attr('stroke-width') * oldRatio  / newRatio

        _this.cursor.setRadius(6 * newDoc.slide.width_ratio / 100)

    if originalWidth <= originalHeight
      # square => boardHeight is the shortest side
      @adjustedWidth = boardHeight * originalWidth / originalHeight
      $('#whiteboard-paper').width(@adjustedWidth)
      @addImageToPaper(data, @adjustedWidth, boardHeight)
      @adjustedHeight = boardHeight
    else
      @adjustedHeight = boardWidth * originalHeight / originalWidth
      $('#whiteboard-paper').height(@adjustedHeight)
      @addImageToPaper(data, boardWidth, @adjustedHeight)
      @adjustedWidth = boardWidth

    @zoomAndPan(currentSlide.slide.width_ratio, currentSlide.slide.height_ratio,
      currentSlide.slide.x_offset, currentSlide.slide.y_offset)
