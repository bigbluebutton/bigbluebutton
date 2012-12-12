define [
  'jquery',
  'underscore',
  'backbone',
  'raphael',
  'globals',
  'cs!utils'
], ($, _, Backbone, Raphael, globals, Utils) ->

  # TODO: text, ellipse, line, rect and cursor could be models

  # TODO: temporary solution
  PRESENTATION_SERVER = window.location.protocol + "//" + window.location.host
  PRESENTATION_SERVER = PRESENTATION_SERVER.replace(/:\d+/, "/") # remove :port

  # "Paper" which is the Raphael term for the entire SVG object on the webpage.
  # This class deals with this SVG component only.
  WhiteboardPaperModel = Backbone.Model.extend

    # Container must be a DOM element
    initialize: (@container) ->
      @gw = null
      @gh = null
      @cursor = null
      @cursorRadius = 4
      @slides = null
      @currentUrl = null
      @fitToPage = true
      @currentShapes = null
      @currentLine = null
      @currentRect = null
      @currentEllipse = null
      @zoomLevel = 1
      $(window).on "resize", _.bind(@onWindowResize, @)
      # TODO: at this point the dimensions of @container are 0
      @updateContainerDimensions()

    # Override the close() to unbind events.
    close: ->
      $(window).off "resize"
      Backbone.View.prototype.close.call(@)

    # Initializes the paper in the page.
    create: ->
      # paper is embedded within the div#slide of the page.
      @raphaelObj ?= Raphael(@container, @gw, @gh)
      @raphaelObj.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"
      @cursor = @raphaelObj.circle(0, 0, @cursorRadius)
      @cursor.attr "fill", "red"
      # TODO $(@cursor.node).bind "mousewheel", zoomSlide
      if @slides
        @rebuild()
      else
        @slides = {} # if previously loaded
      unless navigator.userAgent.indexOf("Firefox") is -1
        @raphaelObj.renderfix()

    # Re-add the images to the paper that are found
    # in the slides array (an object of urls and dimensions).
    rebuild: ->
      @currentUrl = null
      for url of @slides
        if @slides.hasOwnProperty(url)
          @addImageToPaper url, @slides[url].w, @slides[url].h

    # Called when the application window is resized.
    onWindowResize: ->
      @updateContainerDimensions()

    # Update the dimensions of the container.
    updateContainerDimensions: ->
      @containerWidth = $(@container).innerWidth()
      @containerHeight = $(@container).innerHeight()

    # Add an image to the paper.
    # @param {string} url the URL of the image to add to the paper
    # @param {number} width   the width of the image (in pixels)
    # @param {number} height   the height of the image (in pixels)
    # @return {Raphael.image} the image object added to the whiteboard
    addImageToPaper: (url, width, height) ->
      console.log "adding image to paper", url, width, height
      if @fitToPage
        # solve for the ratio of what length is going to fit more than the other
        max = Math.max(width / @containerWidth, height / @containerHeight)
        # fit it all in appropriately
        # TODO: temporary solution
        url = PRESENTATION_SERVER + url unless url.match(/http[s]?:/)
        img = @raphaelObj.image(url, cx = 0, cy = 0, @gw = width, @gh = height)

        # update the global variables we will need to use
        sw = width / max # TODO: needed?
        sh = height / max # TODO: needed?
        # sw_orig = sw
        # sh_orig = sh
      else
        # fit to width
        # assume it will fit width ways
        wr = width / @containerWidth
        img = @raphaelObj.image(url, cx = 0, cy = 0, width / wr, height / wr)
        sw = width / wr
        sh = height / wr
        # sw_orig = sw
        # sh_orig = sh
        @gw = sw
        @gh = sh
      @slides[url] =
        id: img.id
        w: width
        h: height

      unless @currentUrl
        img.toBack()
        @currentUrl = url
      else if @currentUrl is url
        img.toBack()
      else
        img.hide()
      # TODO img.mousemove onCursorMove
      # TODO $(img.node).bind "mousewheel", zoomSlide
      @trigger('paper:image:added', img)
      img

    # Removes all the images from the Raphael paper.
    removeAllImagesFromPaper: ->
      for url of @slides
        if @slides.hasOwnProperty(url)
          @raphaelObj.getById(@slides[url].id).remove()
          @trigger('paper:image:removed', @slides[url].id)
      @slides = {}
      @currentUrl = null

    # Retrieves an image element from the paper.
    # The url must be in the slides array.
    # @param  {string} url        the url of the image (must be in slides array)
    # @return {Raphael.image}     return the image or null if not found
    getImageFromPaper: (url) ->
      if @slides[url]
        id = @slides[url].id
        return @raphaelObj.getById(id) if id?
      null

    # Hides an image from the paper given the URL.
    # The url must be in the slides array.
    # @param  {string} url the url of the image (must be in slides array)
    hideImageFromPaper: (url) ->
      img = @getImageFromPaper(url)
      img.hide() if img?

    # Shows an image from the paper.
    # The url must be in the slides array.
    # @param  {string} url the url of the image (must be in slides array)
    showImageFromPaper: (url) ->
      unless @currentUrl is url
        # TODO: temporary solution
        url = PRESENTATION_SERVER + url unless url.match(/http[s]?:/)
        @hideImageFromPaper @currentUrl
        next = @getImageFromPaper(url)
        if next
          next.show()
          next.toFront()
          @currentShapes.forEach (element) ->
            element.toFront()
          @bringCursorToFront()
        @currentUrl = url

    # Updates the paper from the server values.
    # @param  {number} cx_ the x-offset value as a percentage of the original width
    # @param  {number} cy_ the y-offset value as a percentage of the original height
    # @param  {number} sw_ the slide width value as a percentage of the original width
    # @param  {number} sh_ the slide height value as a percentage of the original height
    # TODO: not tested yet
    updatePaperFromServer: (cx_, cy_, sw_, sh_) ->
      # if updating the slide size (zooming!)
      if sw_ and sh_
        @raphaelObj.setViewBox cx_ * @gw, cy_ * @gh, sw_ * @gw, sh_ * @gh
        sw = @gw / sw_
        sh = @gh / sh_
      # just panning, so use old slide size values
      else
        @raphaelObj.setViewBox cx_ * @gw, cy_ * @gh, @raphaelObj._viewBox[2], @raphaelObj._viewBox[3]

      # update corners
      cx = cx_ * sw
      cy = cy_ * sh
      # update position of svg object in the window
      sx = (vw - @gw) / 2
      sy = (vh - @gh) / 2
      sy = 0  if sy < 0
      @raphaelObj.canvas.style.left = sx + "px"
      @raphaelObj.canvas.style.top = sy + "px"
      @raphaelObj.setSize @gw - 2, @gh - 2

      # update zoom level and cursor position
      z = @raphaelObj._viewBox[2] / @gw
      @cursor.attr r: dcr * z
      @zoomLevel = z

      # force the slice attribute despite Raphael changing it
      @raphaelObj.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"

    # Sets the fit to page.
    # @param {boolean} value If true fit to page. If false fit to width.
    # TODO: not really working as it should be
    setFitToPage: (value) ->
      @fitToPage = value
      temp = @slides
      @removeAllImagesFromPaper()
      @slides = temp
      # re-add all the images as they should fit differently
      @rebuild()
      # set to default zoom level
      globals.connection.emitPaperUpdate 0, 0, 1, 1
      # get the shapes to reprocess
      globals.connection.emitAllShapes()

    # Clear all shapes from this paper.
    clearShapes: ->
      console.log "clearing shapes", @currentShapes
      if @currentShapes?
        @currentShapes.forEach (element) ->
          element.remove()

    # Draws an array of shapes to the paper.
    # @param  {array} shapes the array of shapes to draw
    drawListOfShapes: (shapes) ->
      @currentShapes = @raphaelObj.set()
      for shape in shapes
        data = JSON.parse(shape.data)
        switch shape.shape
          when "path"
            @drawLine.apply @, data
          when "rect"
            @drawRect.apply @, data
          when "ellipse"
            @drawEllipse.apply @, data
          when "text"
            @drawText.apply @, data

      # make sure the cursor is still on top
      @bringCursorToFront()

    # Updated a shape `shape` with the data in `data`.
    updateShape: (shape, data) ->
      switch shape
        when "line"
          @updateLine.apply @, data
        when "rect"
          @updateRect.apply @, data
        when "ellipse"
          @updateEllipse.apply @, data
        when "text"
          @updateText.apply @, data
        else
          console.log "shape not recognized at updateShape", shape

    # Make a shape `shape` with the data in `data`.
    makeShape: (shape, data) ->
      switch shape
        when "line"
          @makeLine.apply @, data
        when "rect"
          @makeRect.apply @, data
        when "ellipse"
          @makeEllipse.apply @, data
        else
          console.log "shape not recognized at makeShape", shape

    # Update the cursor position on screen
    # @param  {number} x the x value of the cursor as a percentage of the width
    # @param  {number} y the y value of the cursor as a percentage of the height
    moveCursor: (x, y) ->
      @cursor.attr
        cx: x * @gw
        cy: y * @gh

    # Puts the cursor on top so it doesn't get hidden behind any objects.
    bringCursorToFront: ->
      @cursor.toFront()

    # Drawing a line from the list o
    # @param  {string} path      height of the shape as a percentage of the original height
    # @param  {string} colour    the colour of the shape to be drawn
    # @param  {number} thickness the thickness of the line to be drawn
    drawLine: (path, colour, thickness) ->
      line = @raphaelObj.path(Utils.stringToScaledPath(path, @gw, @gh))
      line.attr
        stroke: colour
        "stroke-width": thickness
      @currentShapes.push line

    # Draw a rectangle on the paper
    # @param  {number} x         the x value of the object as a percentage of the original width
    # @param  {number} y         the y value of the object as a percentage of the original height
    # @param  {number} w         width of the shape as a percentage of the original width
    # @param  {number} h         height of the shape as a percentage of the original height
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    # TODO: not tested yet
    drawRect: (x, y, w, h, colour, thickness) ->
      r = @raphaelObj.rect(x * @gw, y * @gh, w * @gw, h * @gh)
      if colour
        r.attr
          stroke: colour
          "stroke-width": thickness
      @currentShapes.push r

    # Draw an ellipse on the whiteboard
    # @param  {[type]} cx        the x value of the center as a percentage of the original width
    # @param  {[type]} cy        the y value of the center as a percentage of the original height
    # @param  {[type]} rx        the radius-x of the ellipse as a percentage of the original width
    # @param  {[type]} ry        the radius-y of the ellipse as a percentage of the original height
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    # TODO: not tested yet
    drawEllipse: (cx, cy, rx, ry, colour, thickness) ->
      elip = @raphaelObj.ellipse(cx * @gw, cy * @gh, rx * @gw, ry * @gh)
      if colour
        elip.attr
          stroke: colour
          "stroke-width": thickness
      @currentShapes.push elip

    # Drawing the text on the whiteboard from object
    # @param  {string} t        the text of the text object
    # @param  {number} x        the x value of the object as a percentage of the original width
    # @param  {number} y        the y value of the object as a percentage of the original height
    # @param  {number} w        the width of the text box as a percentage of the original width
    # @param  {number} spacing  the spacing between the letters
    # @param  {string} colour   the colour of the text
    # @param  {string} font     the font family of the text
    # @param  {number} fontsize the size of the font (in PIXELS)
    # TODO: not tested yet
    drawText: (t, x, y, w, spacing, colour, font, fontsize) ->
      x = x * @gw
      y = y * @gh
      txt = @raphaelObj.text(x, y, "").attr(
        fill: colour
        "font-family": font
        "font-size": fontsize
      )
      txt.node.style["text-anchor"] = "start" # force left align
      txt.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
      dy = textFlow(t, txt.node, w, x, spacing, false)
      @currentShapes.push txt

    # Make a line on the whiteboard that could be updated shortly after
    # @param  {number} x         the x value of the line start point as a percentage of the original width
    # @param  {number} y         the y value of the line start point as a percentage of the original height
    # @param  {string} colour    the colour of the shape to be drawn
    # @param  {number} thickness the thickness of the line to be drawn
    # TODO: not tested yet
    makeLine: (x, y, colour, thickness) ->
      x *= @gw
      y *= @gh
      @currentLine = @raphaelObj.path("M" + x + " " + y + "L" + x + " " + y)
      if colour
        @currentLine.attr
          stroke: colour
          "stroke-width": thickness
      @currentShapes.push @currentLine

    # Socket response - Make rectangle on canvas
    # @param  {number} x         the x value of the object as a percentage of the original width
    # @param  {number} y         the y value of the object as a percentage of the original height
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    # TODO: not tested yet
    makeRect: (x, y, colour, thickness) ->
      @currentRect = @raphaelObj.rect(x * @gw, y * @gh, 0, 0)
      if colour
        @currentRect.attr
          stroke: colour
          "stroke-width": thickness
      @currentShapes.push @currentRect

    # Make an ellipse on the whiteboard
    # @param  {[type]} cx        the x value of the center as a percentage of the original width
    # @param  {[type]} cy        the y value of the center as a percentage of the original height
    # @param  {string} colour    the colour of the object
    # @param  {number} thickness the thickness of the object's line(s)
    # TODO: not tested yet
    makeEllipse: (cx, cy, colour, thickness) ->
      @currentEllipse = @raphaelObj.ellipse(cx * @gw, cy * @gh, 0, 0)
      if colour
        @currentEllipse.attr
          stroke: colour
          "stroke-width": thickness
      @currentShapes.push @currentEllipse

    # Updating drawing the line
    # @param  {number} x2  the next x point to be added to the line as a percentage of the original width
    # @param  {number} y2  the next y point to be added to the line as a percentage of the original height
    # @param  {boolean} add true if the line should be added to the current line, false if it should replace the last point
    # TODO: not tested yet
    updateLine: (x2, y2, add) ->
      if @currentLine?
        x2 *= @gw
        y2 *= @gh

        # if adding to the line
        if add
          @currentLine.attr path: (@currentLine.attrs.path + "L" + x2 + " " + y2)

        # if simply updating the last portion (for drawing a straight line)
        else
          @currentLine.attrs.path.pop()
          path = @currentLine.attrs.path.join(" ")
          @currentLine.attr path: (path + "L" + x2 + " " + y2)

    # Socket response - Update rectangle drawn
    # @param  {number} x1 the x value of the object as a percentage of the original width
    # @param  {number} y1 the y value of the object as a percentage of the original height
    # @param  {number} w  width of the shape as a percentage of the original width
    # @param  {number} h  height of the shape as a percentage of the original height
    # TODO: not tested yet
    updateRect: (x1, y1, w, h) ->
      if @currentRect?
        @currentRect.attr
          x: (x1) * @gw
          y: (y1) * @gh
          width: w * @gw
          height: h * @gh

    # Socket response - Update rectangle drawn
    # @param  {number} x the x value of the object as a percentage of the original width
    # @param  {number} y the y value of the object as a percentage of the original height
    # @param  {number} w width of the shape as a percentage of the original width
    # @param  {number} h height of the shape as a percentage of the original height
    # TODO: not tested yet
    updateEllipse: (x, y, w, h) ->
      if @currentEllipse?
        @currentEllipse.attr
          cx: x * @gw
          cy: y * @gh
          rx: w * @gw
          ry: h * @gh

    # Updating the text from the messages on the socket
    # @param  {string} t        the text of the text object
    # @param  {number} x        the x value of the object as a percentage of the original width
    # @param  {number} y        the y value of the object as a percentage of the original height
    # @param  {number} w        the width of the text box as a percentage of the original width
    # @param  {number} spacing  the spacing between the letters
    # @param  {string} colour   the colour of the text
    # @param  {string} font     the font family of the text
    # @param  {number} fontsize the size of the font (in PIXELS)
    updateText: (t, x, y, w, spacing, colour, font, fontsize) ->
      x = x * @gw
      y = y * @gh
      unless @currentText?
        # TODO: does almost the same as calling @drawText()
        @currentText = @raphaelObj.text(x, y, "").attr(
          fill: colour
          "font-family": font
          "font-size": fontsize
        )
        @currentText.node.style["text-anchor"] = "start" # force left align
        @currentText.node.style["textAnchor"] = "start"  # for firefox, 'cause they like to be different
        @currentShapes.push text
      else
        @currentText.attr fill: colour
        cell = @currentText.node
        cell.removeChild cell.firstChild  while cell.hasChildNodes()
        dy = textFlow(t, cell, w, x, spacing, false)
      @cursor.toFront()

    # zoomSlide: ->
    #   ???
    # onCursorMove: ->
      # ??

  WhiteboardPaperModel
