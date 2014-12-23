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

  # Override the close() to unbind events.
  unbindEvents: ->
    $(window).off "resize.whiteboard_paper"
    $(document).off "keydown.whiteboard_paper"
    $(document).off "keyup.whiteboard_paper"
    # TODO: other events are being used in the code and should be off() here

  # Initializes the paper in the page.
  # Can't do these things in initialize() because by then some elements
  # are not yet created in the page.
  create: ->
    # paper is embedded within the div#slide of the page.
    # @raphaelObj ?= ScaleRaphael(@container, "900", "500")

    h = $("#"+@container).height()
    w = $("#"+@container).width()
    #console.log "h: #{h}"
    #console.log "w: #{w}"

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

  # A wrapper around ScaleRaphael's `changeSize()` method, more details at:
  #   http://www.shapevent.com/scaleraphael/
  # Also makes sure that the images are redraw in the canvas so they are actually resized.
  changeSize: (windowWidth, windowHeight, center=true, clipping=false) ->
    if @raphaelObj?
      @raphaelObj.changeSize(windowWidth, windowHeight, center, clipping)

      # TODO: we can scale the slides and drawings instead of re-adding them, but the logic
      #       will change quite a bit
      # slides
      slidesTmp = _.clone(@slides)
      urlTmp = @current.slide
      @removeAllImagesFromPaper()
      @slides = slidesTmp
      @rebuild()
      @showImageFromPaper(urlTmp?.url)
      # drawings
      tmp = _.clone(@current.shapeDefinitions)
      @clearShapes()
      @drawListOfShapes(tmp)

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
    $(@container).on "mousemove", _.bind(@_onMouseMove, @)
    $(@container).on "mousewheel", _.bind(@_zoomSlide, @)
    # TODO $(img.node).bind "mousewheel", zoomSlide
    #@trigger('paper:image:added', img)

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

  # Shows an image from the paper.
  # The url must be in the slides array.
  # @param  {string} url the url of the image (must be in slides array)
  showImageFromPaper: (url) ->
    # TODO: temporary solution
    url = @_slideUrl(url)
    if not @current.slide? or (@slides[url]? and @current.slide.url isnt url)
      @_hideImageFromPaper(@current.slide.url) if @current.slide?
      next = @_getImageFromPaper(url)
      if next
        next.show()
        next.toFront()
        @current.shapes.forEach (element) ->
          element.toFront()
        @cursor.toFront()
      @current.slide = @slides[url]


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

  # Sets the fit to page.
  # @param {boolean} value If true fit to page. If false fit to width.
  # TODO: not really working as it should be
  setFitToPage: (value) ->
    @fitToPage = value

    # TODO: we can scale the slides and drawings instead of re-adding them, but the logic
    #       will change quite a bit
    temp = @slides
    @removeAllImagesFromPaper()
    @slides = temp
    # re-add all the images as they should fit differently
    @rebuild()

  # Socket response - Update zoom variables and viewbox
  # @param {number} d the delta value from the scroll event
  # @return {undefined}
  setZoom: (d) ->
    step = 0.05 # step size
    if d < 0
      @zoomLevel += step # zooming out
    else
      @zoomLevel -= step # zooming in

    [sw, sh] = @_currentSlideDimensions()
    [cx, cy] = @_currentSlideOffsets()
    x = cx / sw
    y = cy / sh
    # cannot zoom out further than 100%
    z = (if @zoomLevel > 1 then 1 else @zoomLevel)
    # cannot zoom in further than 400% (1/4)
    z = (if z < 0.25 then 0.25 else z)
    # cannot zoom to make corner less than (x,y) = (0,0)
    x = (if x < 0 then 0 else x)
    y = (if y < 0 then 0 else y)
    # cannot view more than the bottom corners
    zz = 1 - z
    x = (if x > zz then zz else x)
    y = (if y > zz then zz else y)

  stopPanning: ->
    # nothing to do

  # Draws an array of shapes to the paper.
  # @param  {array} shapes the array of shapes to draw
  drawListOfShapes: (shapes) ->
    @current.shapeDefinitions = shapes
    @current.shapes = @raphaelObj.set()
    for shape in shapes
      shapeType = shape?.shape?.shape_type
      dataBlock = shape?.shape?.shape
      data = if _.isString(dataBlock) then JSON.parse(dataBlock) else dataBlock
      tool = @_createTool(shapeType)
      if tool?
        @current.shapes.push tool.draw.apply(tool, data)
      else
        console.log "shape not recognized at drawListOfShapes", shape

    # make sure the cursor is still on top
    @cursor.toFront()

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

  # Update the slide to move and zoom
  # @param  {number} xOffset the x value of offset
  # @param  {number} yOffset the y value of offset
  # @param  {number} widthRatio the ratio of the previous width
  # @param  {number} heightRatio the ratio of the previous height
  moveAndZoom: (xOffset, yOffset, widthRatio, heightRatio) ->
    @globalxOffset = xOffset
    @globalyOffset = yOffset
    @globalwidthRatio = widthRatio
    @globalheightRatio = heightRatio

    [slideWidth, slideHeight] = @_currentSlideOriginalDimensions()
    #console.log("xOffset: " + xOffset + ", yOffset: " + yOffset);
    #console.log("@containerWidth: " + @containerWidth + " @containerHeight: " + @containerHeight);
    #console.log("slideWidth: " + slideWidth + " slideHeight: " + slideHeight);
    baseWidth = (@containerWidth - slideWidth) / 2
    baseHeight = (@containerHeight - slideHeight) / 2


    #get the actual size of the slide, depending on the limiting factor (container width or container height)

    actualWidth = @current.slide.displayWidth
    actualHeight = @current.slide.displayHeight
    #console.log("actualWidth:" + actualWidth + " actualHeight: " + actualHeight)

    #calculate parameters to pass
    newXPos = baseWidth - 2* xOffset * actualWidth / 100
    newyPos = baseHeight - 2* yOffset * actualHeight / 100
    newWidth = actualWidth  /  100 * widthRatio
    newHeight = actualHeight / 100 * heightRatio

    @viewBoxXpos = newXPos
    @viewBoxYPos = newyPos
    @viewBoxWidth = newWidth
    @viewBoxHeight = newHeight

    #console.log("newXPos: " + newXPos + " newyPos: " + newyPos + " newWidth: " + newWidth + " newHeight: " + newHeight)

    #set parameters to raphael viewbox
    @raphaelObj.setViewBox(newXPos , newyPos,  newWidth , newHeight , true)

    # update the rectangle elements which create the border when page is zoomed
    @borders.left.attr( {width:newXPos, height: @containerHeight} )

    @borders.right.attr(
      x: newXPos + newWidth
      y: 0
      width:newXPos
      height:@containerHeight
    )

    @borders.top.attr(
      width: @containerWidth
      height: newyPos
    )

    @borders.bottom.attr(
      y: newyPos + newHeight
      width: @containerWidth
      height: @containerHeight
    )

    # borders should appear infront of every other element (i.e. shapes)
    for _, border of @borders
      border.toFront()

    #update cursor to appear the same size even when page is zoomed in
    @cursor.setRadius( 3 * widthRatio / 100 )

  zoomAndPan: (widthRatio, heightRatio, xOffset, yOffset) ->
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

  # Hides an image from the paper given the URL.
  # The url must be in the slides array.
  # @param  {string} url the url of the image (must be in slides array)
  _hideImageFromPaper: (url) ->
    img = @_getImageFromPaper(url)
    img.hide() if img?

  # Update zoom variables on all clients
  # @param  {Event} e the event that occurs when scrolling
  # @param  {number} delta the speed/direction at which the scroll occurred
  _zoomSlide: (e, delta) ->
    #globals.connection.emitZoom delta

  # Called when the cursor is moved over the presentation.
  # Sends cursor moving event to server.
  # @param  {Event} e the mouse event
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # TODO: this should only be done if the user is the presenter
  _onMouseMove: (e, x, y) ->
    [sw, sh] = @_currentSlideDimensions()
    xLocal = (e.pageX - @containerOffsetLeft) / sw
    yLocal = (e.pageY - @containerOffsetTop) / sh

  # When the user is dragging the cursor (click + move)
  # @param  {number} dx the difference between the x value from panGo and now
  # @param  {number} dy the difference between the y value from panGo and now
  _panDragging: (dx, dy) ->
    [slideWidth, slideHeight] = @_currentSlideOriginalDimensions()
    sx = (@containerWidth - slideWidth) / 2
    sy = (@containerHeight - slideHeight) / 2
    [sw, sh] = @_currentSlideDimensions()

    # ensuring that we cannot pan outside of the boundaries
    x = (@panX - dx)
    # cannot pan past the left edge of the page
    x = (if x < 0 then 0 else x)
    y = (@panY - dy)
    # cannot pan past the top of the page
    y = (if y < 0 then 0 else y)
    if @fitToPage
      x2 = slideWidth + x
    else
      x2 = @containerWidth + x
    # cannot pan past the width
    x = (if x2 > sw then sw - (@containerWidth - sx * 2) else x)
    if @fitToPage
      y2 = slideHeight + y
    else
      # height of image could be greater (or less) than the box it fits in
      y2 = @containerHeight + y
    # cannot pan below the height
    y = (if y2 > sh then sh - (@containerHeight - sy * 2) else y)
    #globals.connection.emitPaperUpdate x / sw, y / sh, null, null

  # When panning starts
  # @param  {number} x the x value of the cursor
  # @param  {number} y the y value of the cursor
  _panGo: (x, y) ->
    [cx, cy] = @_currentSlideOffsets()
    @panX = cx
    @panY = cy

  # When panning finishes
  # @param  {Event} e the mouse event
  _panStop: (e) ->
    @stopPanning()

  # when pressing down on a key at anytime
  _onKeyDown: (event) ->
    unless event
      keyCode = window.event.keyCode
    else
      keyCode = event.keyCode
    switch keyCode
      when 16 # shift key
        @shiftPressed = true

  # when releasing any key at any time
  _onKeyUp: ->
    unless event
      keyCode = window.event.keyCode
    else
      keyCode = event.keyCode
    switch keyCode
      when 16 # shift key
        @shiftPressed = false

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
