define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'scale.raphael',
  'globals',
  'cs!utils',
  'cs!models/whiteboard_cursor',
  'cs!models/whiteboard_slide',
  'cs!models/whiteboard_rect',
  'cs!models/whiteboard_line',
  'cs!models/whiteboard_ellipse',
  'cs!models/whiteboard_triangle',
  'cs!models/whiteboard_text'
], ($, _, Backbone, Raphael, ScaleRaphael, globals, Utils,
    WhiteboardCursorModel, WhiteboardSlideModel, WhiteboardRectModel, WhiteboardLineModel,
    WhiteboardEllipseModel, WhiteboardTriangleModel, WhiteboardTextModel) ->

  # "Paper" which is the Raphael term for the entire SVG object on the webpage.
  # This class deals with this SVG component only.
  WhiteboardPaperModel = Backbone.Model.extend

    # Container must be a DOM element
    initialize: (@container) ->
      alert("initializing the paper model")
      # a WhiteboardCursorModel
      @cursor = null

      # all slides in the presentation indexed by url
      @slides = {}
      # the slide being shown
      @currentSlide = null

      @fitToPage = true
      @panX = null
      @panY = null

      # a raphaeljs set with all the shapes in the current slide
      @currentShapes = null
      # a list of shapes as passed to this client when it receives `all_slides`
      # (se we are able to redraw the shapes whenever needed)
      @currentShapesDefinitions = []
      # pointers to the current shapes being drawn
      @currentLine = null
      @currentRect = null
      @currentEllipse = null
      @currentTriangle = null
      @currentText = null

      @zoomLevel = 1
      @shiftPressed = false
      @currentPathCount = 0

      $(window).on "resize.whiteboard_paper", _.bind(@_onWindowResize, @)
      $(document).on "keydown.whiteboard_paper", _.bind(@_onKeyDown, @)
      $(document).on "keyup.whiteboard_paper", _.bind(@_onKeyUp, @)

      @_updateContainerDimensions()

      # Bind to the event triggered when the client connects to the server
      if globals.connection.isConnected()
        @_registerEvents()
      else
        globals.events.on "connection:connected", =>
          @_registerEvents()



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
      @raphaelObj ?= ScaleRaphael(@container, "100%", "100%")
      @raphaelObj.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"

      @cursor = new WhiteboardCursorModel(@raphaelObj)
      @cursor.draw()
      @cursor.on "cursor:mousewheel", _.bind(@_zoomSlide, @)

      if @slides
        @rebuild()
      else
        @slides = {} # if previously loaded
      unless navigator.userAgent.indexOf("Firefox") is -1
        @raphaelObj.renderfix()

      #initializing boarder around slide to cover up areas which shouldnt show

      @boarderLeft = @raphaelObj.rect(0, 0, 0, 0 )
      @boarderRight = @raphaelObj.rect(0, 0, 0, 0 )

      @boarderTop = @raphaelObj.rect(0,0, 0, 0)
      @boarderBottom = @raphaelObj.rect(0,0, 0, 0)

      @boarderLeft.attr("fill", "#ababab")
      @boarderLeft.attr( {stroke:"#ababab"} )


      @boarderRight.attr("fill", "#ababab")
      @boarderRight.attr( {stroke:"#ababab"} )


      @boarderTop.attr("fill", "#ababab")
      @boarderTop.attr( {stroke:"#ababab"} )


      @boarderBottom.attr("fill", "#ababab")
      @boarderBottom.attr( {stroke:"#ababab"} )


    # Re-add the images to the paper that are found
    # in the slides array (an object of urls and dimensions).
    rebuild: ->
      @currentSlide = null
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
        urlTmp = @currentSlide
        @removeAllImagesFromPaper()
        @slides = slidesTmp
        @rebuild()
        @showImageFromPaper(urlTmp?.url)
        # drawings
        tmp = _.clone(@currentShapesDefinitions)
        @clearShapes()
        @drawListOfShapes(tmp)

    # Add an image to the paper.
    # @param {string} url the URL of the image to add to the paper
    # @param {number} width   the width of the image (in pixels)
    # @param {number} height   the height of the image (in pixels)
    # @return {Raphael.image} the image object added to the whiteboard
    addImageToPaper: (url, width, height) ->
      @_updateContainerDimensions()
    
      if @fitToPage
        # solve for the ratio of what length is going to fit more than the other
        max = Math.max(width / @containerWidth, height / @containerHeight)
        # fit it all in appropriately
        # TODO: temporary solution
        url = @_slideUrl(url)
        sw = width / max
        sh = height / max
        cx = (@containerWidth / 2) - (width / 2)
        cy = (@containerHeight / 2) - (height / 2)
        img = @raphaelObj.image(url, cx, cy, width, height)
        originalWidth = width
        originalHeight = height
      else
        # fit to width
        console.log "ERROR! The slide did not fit"
        # assume it will fit width ways
        sw = width / wr
        sh = height / wr
        wr = width / @containerWidth
        originalWidth = sw
        originalHeight = sh
        sw = width / wr
        sh = height / wr
        img = @raphaelObj.image(url, cx = 0, cy = 0, sw, sh)

      # sw slide width as percentage of original width of paper
      # sh slide height as a percentage of original height of paper
      # x-offset from top left corner as percentage of original width of paper
      # y-offset from top left corner as percentage of original height of paper
      @slides[url] = new WhiteboardSlideModel(img.id, url, img, originalWidth, originalHeight, sw, sh, cx, cy)

      unless @currentSlide?
        img.toBack()
        @currentSlide = @slides[url]
      else if @currentSlide.url is url
        img.toBack()
      else
        img.hide()
      $(@container).on "mousemove", _.bind(@_onMouseMove, @)
      $(@container).on "mousewheel", _.bind(@_zoomSlide, @)
      # TODO $(img.node).bind "mousewheel", zoomSlide
      @trigger('paper:image:added', img)

      # TODO: other places might also required an update in these dimensions
      @_updateContainerDimensions()

      img

    # Removes all the images from the Raphael paper.
    removeAllImagesFromPaper: ->
      for url of @slides
        if @slides.hasOwnProperty(url)
          @raphaelObj.getById(@slides[url].getId()).remove()
          @trigger('paper:image:removed', @slides[url].getId())
      @slides = {}
      @currentSlide = null

    # Shows an image from the paper.
    # The url must be in the slides array.
    # @param  {string} url the url of the image (must be in slides array)
    showImageFromPaper: (url) ->
      # TODO: temporary solution
      url = @_slideUrl(url)
      if not @currentSlide? or (@slides[url]? and @currentSlide.url isnt url)
        @_hideImageFromPaper(@currentSlide.url) if @currentSlide?
        next = @_getImageFromPaper(url)
        if next
          next.show()
          next.toFront()
          @currentShapes.forEach (element) ->
            element.toFront()
          @cursor.toFront()
        @currentSlide = @slides[url]

    # Updates the paper from the server values.
    # @param  {number} cx_ the x-offset value as a percentage of the original width
    # @param  {number} cy_ the y-offset value as a percentage of the original height
    # @param  {number} sw_ the slide width value as a percentage of the original width
    # @param  {number} sh_ the slide height value as a percentage of the original height
    # TODO: not working as it should
    updatePaperFromServer: (cx_, cy_, sw_, sh_) ->
      # # if updating the slide size (zooming!)
      # [slideWidth, slideHeight] = @_currentSlideOriginalDimensions()
      # if sw_ and sh_
      #   @raphaelObj.setViewBox cx_ * slideWidth, cy_ * slideHeight, sw_ * slideWidth, sh_ * slideHeight,
      #   sw = slideWidth / sw_
      #   sh = slideHeight / sh_
      # # just panning, so use old slide size values
      # else
      #   [sw, sh] = @_currentSlideDimensions()
      #   @raphaelObj.setViewBox cx_ * slideWidth, cy_ * slideHeight, @raphaelObj._viewBox[2], @raphaelObj._viewBox[3]

      # # update corners
      # cx = cx_ * sw
      # cy = cy_ * sh
      # # update position of svg object in the window
      # sx = (@containerWidth - slideWidth) / 2
      # sy = (@containerHeight - slideHeight) / 2
      # sy = 0  if sy < 0
      # @raphaelObj.canvas.style.left = sx + "px"
      # @raphaelObj.canvas.style.top = sy + "px"
      # @raphaelObj.setSize slideWidth - 2, slideHeight - 2

      # # update zoom level and cursor position
      # z = @raphaelObj._viewBox[2] / slideWidth
      # @zoomLevel = z
      # dcr = 1
      # @cursor.setRadius(dcr * z)

      # # force the slice attribute despite Raphael changing it
      # @raphaelObj.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"

    # Switches the tool and thus the functions that get
    # called when certain events are fired from Raphael.
    # @param  {string} tool the tool to turn on
    # @return {undefined}
    setCurrentTool: (tool) ->
      @currentTool = tool
      console.log "setting current tool to", tool
      switch tool
        when "path", "line"
          @cursor.undrag()
          @currentLine = @_createTool(tool)
          @cursor.drag(@currentLine.dragOnMove, @currentLine.dragOnStart, @currentLine.dragOnEnd)
        when "rectangle"
          @cursor.undrag()
          @currentRect = @_createTool(tool)
          @cursor.drag(@currentRect.dragOnMove, @currentRect.dragOnStart, @currentRect.dragOnEnd)

        # TODO: the shapes below are still in the old format
        # when "panzoom"
        #   @cursor.undrag()
        #   @cursor.drag _.bind(@_panDragging, @),
        #     _.bind(@_panGo, @), _.bind(@_panStop, @)
        # when "ellipse"
        #   @cursor.undrag()
        #   @cursor.drag _.bind(@_ellipseDragging, @),
        #     _.bind(@_ellipseDragStart, @), _.bind(@_ellipseDragStop, @)
        # when "text"
        #   @cursor.undrag()
        #   @cursor.drag _.bind(@_rectDragging, @),
        #     _.bind(@_textStart, @), _.bind(@_textStop, @)
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

      # set to default zoom level
      globals.connection.emitPaperUpdate 0, 0, 1, 1
      # get the shapes to reprocess
      globals.connection.emitAllShapes()

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
      globals.connection.emitPaperUpdate x, y, z, z # send update to all clients

    stopPanning: ->
      # nothing to do

    # Draws an array of shapes to the paper.
    # @param  {array} shapes the array of shapes to draw
    drawListOfShapes: (shapes) ->
      alert("drawListOfShapes" + shapes.length)
      @currentShapesDefinitions = shapes
      @currentShapes = @raphaelObj.set()
      for shape in shapes
        data = if _.isString(shape.data) then JSON.parse(shape.data) else shape.data
        tool = @_createTool(shape.shape)
        if tool?
          @currentShapes.push tool.draw.apply(tool, data)
        else
          console.log "shape not recognized at drawListOfShapes", shape

      # make sure the cursor is still on top
      @cursor.toFront()

    # Clear all shapes from this paper.
    clearShapes: ->
      if @currentShapes?
        @currentShapes.forEach (element) ->
          element.remove()
        @currentShapes = []
        @currentShapesDefinitions = []


    # Updated a shape `shape` with the data in `data`.
    # TODO: check if the objects exist before calling update, if they don't they should be created
    updateShape: (shape, data) ->
      switch shape
        when "line"
          @currentLine.update(data)
        when "rectangle"
          @currentRect.update(data)
        when "ellipse"
          @currentEllipse.update(data)
        when "triangle"
          @currentTriangle.update(data)
        when "text"
          @currentText.update.apply(@currentText, data)
        else
          console.log "shape not recognized at updateShape", shape

    # Make a shape `shape` with the data in `data`.
    makeShape: (shape, data) ->
      console.log("shape=" + shape + " data=" + JSON.stringify data)
      tool = null
      switch shape
        when "path", "line"
          @currentLine = @_createTool(shape)
          toolModel = @currentLine
          tool = @currentLine.make(data)
        when "rectangle"
          @currentRect = @_createTool(shape)
          toolModel = @currentRect
          tool = @currentRect.make(data)
        when "ellipse"
          @currentEllipse = @_createTool(shape)
          toolModel = @currentEllipse
          tool = @currentEllipse.make(data)
        when "triangle"
          @currentTriangle = @_createTool(shape)
          toolModel = @currentTriangle
          toolModel.draw(tool, data)
          tool = @currentTriangle.make(data)
        when "text"
          @currentText = @_createTool(shape)
          toolModel = @currentText
          tool = @currentText.make.apply(@currentText, data)
        else
          console.log "shape not recognized at makeShape", shape
      if tool?
        alert("in currentShapes")
        if @currentShapes? #rewrite TODO
          @currentShapes.push(tool)
        else
          @currentShapes = []
          @currentShapes.push(tool)
        @currentShapesDefinitions.push(toolModel.getDefinition())

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

      actualWidth = @currentSlide.displayWidth
      actualHeight = @currentSlide.displayHeight
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


      #update the rectangle elements which create the boarder when page is zoomed

      @boarderLeft.attr( {width:newXPos, height: @containerHeight} )

      @boarderRight.attr(
        x: newXPos + newWidth
        y: 0
        width:newXPos
        height:@containerHeight
      )


      @boarderTop.attr(
        width: @containerWidth
        height: newyPos
      )


      @boarderBottom.attr(
        y: newyPos + newHeight
        width: @containerWidth
        height: @containerHeight
      )

      #boarders should appear infront of every other element (i.e. shapes)
      @boarderLeft.toFront()
      @boarderRight.toFront()
      @boarderTop.toFront()
      @boarderBottom.toFront()


      #update cursor to appear the same size even when page is zoomed in
      @cursor.setRadius( 3 * widthRatio / 100 )

    # Registers listeners for events in the gloval event bus
    _registerEvents: ->
      globals.events.on "connection:clrPaper", =>
        @clearShapes()

      globals.events.on "connection:allShapes", (allShapesEventObject) =>
        # TODO: a hackish trick for making compatible the shapes from redis with the node.js
        alert("on connection:allShapes:" + JSON.stringify allShapesEventObject)
        shapes = allShapesEventObject.shapes
        for shape in shapes
          properties = JSON.parse(shape.data)
          if shape.shape is "path"
            points = properties[0]
            strPoints = ""
            for i in [0..points.length] by 2
              letter = ""
              pA = points[i]
              pB = points[i+1]
              if i == 0
                letter = "M"
              else
                letter = "L"
              strPoints += letter + (pA/100) + "," + (pB/100)
            properties[0] = strPoints

            shape.data = JSON.stringify properties #TODO

        @clearShapes()
        @drawListOfShapes shapes

      globals.events.on "connection:updShape", (shape, data) =>
        @updateShape shape, data

      globals.events.on "connection:whiteboard_draw_event", (shape, data) =>
        @makeShape shape, data

      globals.events.on "connection:display_page", (data) =>
        console.log ("connection:display_page in whiteboard_paper.coffee")
        @_displayPage data

      globals.events.on "connection:whiteboardDrawPen", (startingData) =>
        type = startingData.payload.shape_type
        color = startingData.payload.data.line.color
        thickness = startingData.payload.data.line.weight
        points = startingData.shape.points
        if type is "line"
          for i in [0..points.length - 1]
            if i is 0
              #make these compatible with a line
              console.log "points[i]: " + points[i]
              lineObject = {
                shape: {
                  type: "line",
                  coordinate: {
                    firstX : points[i].x/100,
                    firstY : points[i].y/100
                  },
                  color: startingData.payload.data.line.color,
                  thickness : startingData.payload.data.line.weight
                }
                adding : false #tell the line object that we are NOT adding points but creating a new line
              }
              console.log "lineObject: " + lineObject
              @makeShape type, lineObject
            else
              console.log "points[i]: "+ points[i]
              lineObject = {
                shape: {
                  type: "line",
                  coordinate: {
                    firstX : points[i].x/100,
                    firstY : points[i].y/100
                  },
                  color: startingData.payload.data.line.color,
                  thickness : startingData.payload.data.line.weight
                }
                adding : true #tell the line object that we ARE adding points and NOT creating a new line
              }
              console.log "lineObject: " + lineObject
              @updateShape type, lineObject 

      globals.events.on "connection:mvCur", (x, y) =>
        @moveCursor(x, y)
        #console.log "x: " + x + " y: " + y

      globals.events.on "connection:move_and_zoom", (xOffset, yOffset, widthRatio, heightRatio) =>
        @moveAndZoom(xOffset, yOffset, widthRatio, heightRatio)

      globals.events.on "connection:changeslide", (url) =>
        @showImageFromPaper(url)

      globals.events.on "connection:viewBox", (xperc, yperc, wperc, hperc) =>
        xperc = parseFloat(xperc, 10)
        yperc = parseFloat(yperc, 10)
        wperc = parseFloat(wperc, 10)
        hperc = parseFloat(hperc, 10)
        @updatePaperFromServer(xperc, yperc, wperc, hperc)

      globals.events.on "connection:fitToPage", (value) =>
        @setFitToPage(value)

      globals.events.on "connection:zoom", (delta) =>
        @setZoom(delta)

      globals.events.on "connection:paper", (cx, cy, sw, sh) =>
        @updatePaperFromServer(cx, cy, sw, sh)

      globals.events.on "connection:panStop", =>
        @stopPanning()

      globals.events.on "connection:toolChanged", (tool) =>
        @setCurrentTool(tool)

      globals.events.on "connection:textDone", =>
        @textDone()

      globals.events.on "connection:uploadStatus", (message, fade) =>
        globals.events.trigger("whiteboard:paper:uploadStatus", message, fade)


    # Update the dimensions of the container.
    _updateContainerDimensions: ->
      $container = $(@container)
      @containerWidth = $container.innerWidth()
      @containerHeight = $container.innerHeight()
      @containerOffsetLeft = $container.offset().left
      @containerOffsetTop = $container.offset().top


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
      globals.connection.emitZoom delta

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
      globals.connection.emitMoveCursor xLocal, yLocal

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
      globals.connection.emitPaperUpdate x / sw, y / sh, null, null

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

    # Called when the application window is resized.
    _onWindowResize: ->
      @_updateContainerDimensions()
      console.log "_onWindowResize"

      #TODO: temporary hacked away fix so that the buttons resize correctly when the window resizes
      $("#users-btn").click();
      $("#users-btn").click();


      #TODO: maybe find solution besides these global values..no conflicts however

      [slideWidth, slideHeight] = @_currentSlideOriginalDimensions()
      #console.log("xOffset: " + xOffset + ", yOffset: " + yOffset);
      #console.log("@containerWidth: " + @containerWidth + " @containerHeight: " + @containerHeight);
      #console.log("slideWidth: " + slideWidth + " slideHeight: " + slideHeight);
      baseWidth = (@containerWidth - slideWidth) / 2
      baseHeight = (@containerHeight - slideHeight) / 2


      #get the actual size of the slide, depending on the limiting factor (container width or container height)
      if(@containerWidth - slideWidth < @containerHeight - slideHeight)
        actualHeight = @containerWidth * slideHeight / slideWidth
        actualWidth = @containerWidth
      else
        actualWidth = @containerHeight * slideWidth / slideHeight
        actualHeight = @containerHeight

      #console.log("actualWidth:" + actualWidth + " actualHeight: " + actualHeight)

      #calculate parameters to pass
      newXPos = baseWidth
      newyPos = baseHeight
      newWidth = actualWidth
      newHeight = actualHeight

      #now the zooming will still be correct when the window is resized
      #and hopefully when rotated on a mobile device
      if @globalxOffset? && @globalyOffset? && @globalwidthRatio? && @globalheightRatio?
        console.log "has zoomed in"
        @moveAndZoom(@globalxOffset, @globalyOffset, @globalwidthRatio, @globalheightRatio)

      else
        obj =
          globalxOffset : @globalxOffset
          globalyOffset : @globalyOffset
          globalwidthRatio : @globalwidthRatio
          globalheightRatio : @globalheightRatio

        console.log obj
        console.log "not zoomed"
        @raphaelObj.setViewBox(newXPos, newyPos, newWidth, newHeight,true)




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
      if @currentSlide? then @currentSlide.getDimensions() else [0, 0]

    _currentSlideOriginalDimensions: ->
      if @currentSlide? then @currentSlide.getOriginalDimensions() else [0, 0]

    _currentSlideOffsets: ->
      if @currentSlide? then @currentSlide.getOffsets() else [0, 0]

    # Wrapper method to create a tool for the whiteboard
    _createTool: (type) ->
      switch type
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
        globals.presentationServer + url

    #Changes the currently displayed page/slide (if any) with this one
    #@param {data} message object containing the "presentation" object
    _displayPage: (data) ->
      @removeAllImagesFromPaper()
      page = data.payload.currentPage
      @addImageToPaper(page.png_uri, 400, 400) #the dimensions should be modified

  WhiteboardPaperModel
