define [ "jquery", "raphael", "cs!chat/connection", "colorwheel" ], ($, Raphael, Connection) ->

  Whiteboard = {}

  # As is done in Connection
  PRESENTATION_SERVER = window.location.protocol + "//" + window.location.host
  PRESENTATION_SERVER = PRESENTATION_SERVER.replace(/:\d+/, "/") # remove :port

  gw = undefined
  gh = undefined
  cx2 = undefined
  cy2 = undefined
  cx1 = undefined
  cy1 = undefined
  px = undefined
  py = undefined
  cx = undefined
  cy = undefined
  sw = undefined
  sh = undefined
  slides = undefined
  textx = undefined
  texty = undefined
  text = undefined
  paper = undefined
  cur = undefined
  s_top = undefined
  s_left = undefined
  current_url = undefined
  ex = undefined
  ey = undefined
  ellipse = undefined
  line = undefined
  scrollh = undefined
  scrollw = undefined
  textoffset = undefined
  current_colour = undefined
  current_thickness = undefined
  path = undefined
  rect = undefined
  sx = undefined
  sy = undefined
  current_shapes = undefined
  sw_orig = undefined
  sh_orig = undefined
  vw = undefined
  vh = undefined
  shift_pressed = undefined
  zoom_level = 1
  fitToPage = true
  path_max = 30
  path_count = 0
  default_colour = "#FF0000"
  default_thickness = 1
  dcr = 3

  # slide_obj = document.getElementById("slide")
  # textbox = document.getElementById("area")

  # $("#area").autosize()

  # Drawing the thickness viewer for client feedback.
  # No messages are sent to the server, it is completely
  # local. Shows visual of thickness for drawing tools.
  # @param  {number} thickness the thickness value
  # @param  {string} colour    the colour it should be displayed as
  # @return {undefined}
  drawThicknessView = (thickness, colour) ->
    current_thickness = thickness
    tctx.fillStyle = "#FFFFFF"
    tctx.fillRect 0, 0, 20, 20
    center = Math.round((20 - thickness + 1) / 2)
    tctx.fillStyle = colour
    tctx.fillRect center, center, thickness + 1, thickness + 1

  # Drawing the colour viewer for client feedback.
  # No messages are sent to the server, it is
  # completely local. Shows colour visual for drawing tools.
  # @param  {string} colour the colour it should be displayed as
  # @return {undefined}
  drawColourView = (colour) ->
    current_colour = colour
    ctx.fillStyle = colour
    cptext.value = colour
    ctx.fillRect 0, 0, 12, 12

  # Toggles the visibility of the colour picker, which is hidden by
  # default. The picker is a RaphaelJS object, so each node of the object
  # must be shown/hidden individually.
  # @return {undefined}
  Whiteboard.toggleColourPicker = ->
    if cpVisible
      cpVisible = false
      cp.raphael.forEach (i) ->
        i.hide()
    else
      cpVisible = true
      cp.raphael.forEach (i) ->
        i.show()

  # Switches the tool and thus the functions that get
  # called when certain events are fired from Raphael.
  # @param  {string} tool the tool to turn on
  # @return {undefined}
  Whiteboard.turnOn = (tool) ->
    current_tool = tool
    console.log "it's here the tool:" + tool
    switch tool
      when "line"
        cur.undrag()
        cur.drag curDragging, curDragStart, curDragStop
      when "rect"
        cur.undrag()
        cur.drag curRectDragging, curRectDragStart, curRectDragStop
      when "panzoom"
        cur.undrag()
        cur.drag panDragging, panGo, panStop
      when "ellipse"
        cur.undrag()
        cur.drag curEllipseDragging, curEllipseDragStart, curEllipseDragStop
      when "text"
        cur.undrag()
        cur.drag curRectDragging, curTextStart, curTextStop
      else
        console.log "ERROR: Cannot turn on tool, invalid tool: " + tool

  # Initializes the "Paper" which is the Raphael term for
  # the entire SVG object on the webpage.
  # @return {undefined}
  initPaper = ->
    # paper is embedded within the div#slide of the page.
    paper = paper or Raphael("slide", gw, gh)
    paper.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"
    cur = paper.circle(0, 0, dcr)
    cur.attr "fill", "red"
    $(cur.node).bind "mousewheel", zoomSlide
    if slides
      rebuildPaper()
    else
      slides = {} # if previously loaded
    unless navigator.userAgent.indexOf("Firefox") is -1
      paper.renderfix()

  # Updates the paper from the server values.
  # @param  {number} cx_ the x-offset value as a percentage of the original width
  # @param  {number} cy_ the y-offset value as a percentage of the original height
  # @param  {number} sw_ the slide width value as a percentage of the original width
  # @param  {number} sh_ the slide height value as a percentage of the original height
  # @return {undefined}
  Whiteboard.updatePaperFromServer = (cx_, cy_, sw_, sh_) ->
    # if updating the slide size (zooming!)
    if sw_ and sh_
      paper.setViewBox cx_ * gw, cy_ * gh, sw_ * gw, sh_ * gh
      sw = gw / sw_
      sh = gh / sh_
    # just panning, so use old slide size values
    else
      paper.setViewBox cx_ * gw, cy_ * gh, paper._viewBox[2], paper._viewBox[3]

    # update corners
    cx = cx_ * sw
    cy = cy_ * sh
    # update position of svg object in the window
    sx = (vw - gw) / 2
    sy = (vh - gh) / 2
    sy = 0  if sy < 0
    paper.canvas.style.left = sx + "px"
    paper.canvas.style.top = sy + "px"
    paper.setSize gw - 2, gh - 2

    # update zoom level and cursor position
    z = paper._viewBox[2] / gw
    cur.attr r: dcr * z
    zoom_level = z

    # force the slice attribute despite Raphael changing it
    paper.canvas.setAttribute "preserveAspectRatio", "xMinYMin slice"

  # Sets the fit to page.
  # @param {boolean} fit fit == true ? -> fit to page. fit == false ? -> fit to width.
  Whiteboard.setFitToPage = (fit) ->
    fitToPage = fit
    temp = slides
    Whiteboard.removeAllImagesFromPaper()
    slides = temp
    # re-add all the images as they should fit differently
    rebuildPaper()
    # set to default zoom level
    Connection.emitPaperUpdate 0, 0, 1, 1
    # get the shapes to reprocess
    Connection.emitAllShapes()

  # Add an image to the paper.
  # @param {string} url the URL of the image to add to the paper
  # @param {number} w   the width of the image (in pixels)
  # @param {number} h   the height of the image (in pixels)
  # @return {Raphael.image} the image object added to the whiteboard
  Whiteboard.addImageToPaper = (url, w, h) ->
    console.log "addIMageToPaper show me url:" + url
    img = undefined
    if fitToPage
      # solve for the ratio of what length is going to fit more than the other
      xr = w / vw
      yr = h / vh
      max = Math.max(xr, yr)
      # fit it all in appropriately
      # TODO: temporary solution
      url = PRESENTATION_SERVER + url
      img = paper.image(url, cx = 0, cy = 0, gw = w, gh = h)
      console.log img

      # update the global variables we will need to use
      sw = w / max
      sh = h / max
      sw_orig = sw
      sh_orig = sh
    else
      # fit to width
      # assume it will fit width ways
      wr = w / vw
      img = paper.image(url, cx = 0, cy = 0, w / wr, h / wr)
      sw = w / wr
      sh = h / wr
      sw_orig = sw
      sh_orig = sh
      gw = sw
      gh = sh
    slides[url] =
      id: img.id
      w: w
      h: h

    unless current_url
      img.toBack()
      current_url = url
    else if current_url is url
      img.toBack()
    else
      img.hide()
    img.mousemove onCursorMove
    $(img.node).bind "mousewheel", zoomSlide
    img

  # Removes all the images from the Raphael paper.
  # @return {undefined}
  Whiteboard.removeAllImagesFromPaper = ->
    img = undefined
    for url of slides
      if slides.hasOwnProperty(url)
        paper.getById(slides[url].id).remove()
        $("#preload" + slides[url].id).remove()
    slides = {}
    current_url = null

  # Draws an array of shapes to the paper.
  # @param  {array} shapes the array of shapes to draw
  # @return {undefined}
  Whiteboard.drawListOfShapes = (shapes) ->
    current_shapes = paper.set()
    i = shapes.length - 1

    while i >= 0
      data = JSON.parse(shapes[i].data)
      switch shapes[i].shape
        when "path"
          drawLine.apply drawLine, data
        when "rect"
          drawRect.apply drawRect, data
        when "ellipse"
          drawEllipse.apply drawEllipse, data
        when "text"
          drawText.apply drawText, data
        else
      i--
    # make sure the cursor is still on top
    bringCursorToFront()

  # Re-add the images to the paper that are found
  # in the slides array (an object of urls and dimensions).
  # @return {undefined}
  rebuildPaper = ->
    current_url = null
    for url of slides
      if slides.hasOwnProperty(url)
        Whiteboard.addImageToPaper url, slides[url].w, slides[url].h

  # Shows an image from the paper.
  # The url must be in the slides array.
  # @param  {string} url the url of the image (must be in slides array)
  # @return {undefined}
  Whiteboard.showImageFromPaper = (url) ->
    unless current_url is url
      # TODO: temporary solution
      url = PRESENTATION_SERVER + url
      hideImageFromPaper current_url
      next = getImageFromPaper(url)
      if next
        next.show()
        next.toFront()
        current_shapes.forEach (element) ->
          element.toFront()

        cur.toFront()
      current_url = url

  # Retrieves an image element from the paper.
  # The url must be in the slides array.
  # @param  {string} url        the url of the image (must be in slides array)
  # @return {Raphael.image}     return the image or null if not found
  getImageFromPaper = (url) ->
    console.log "show me url:" + url
    if slides[url]
      id = slides[url].id
      if id
        paper.getById id
      else
        null
    else
      null

  # Hides an image from the paper given the URL.
  # The url must be in the slides array.
  # @param  {string} url the url of the image (must be in slides array)
  # @return {undefined}
  hideImageFromPaper = (url) ->
    img = getImageFromPaper(url)
    img.hide()  if img

  # Puts the cursor on top so it doesn't
  # get hidden behind any objects/images.
  # @return {undefined}
  bringCursorToFront = ->
    cur.toFront()

  # When panning starts
  # @param  {number} x the x value of the cursor
  # @param  {number} y the y value of the cursor
  # @return {undefined}
  panGo = (x, y) ->
    px = cx
    py = cy

  # When the user is dragging the cursor (click + move)
  # @param  {number} dx the difference between the x value from panGo and now
  # @param  {number} dy the difference between the y value from panGo and now
  # @return {undefined}
  panDragging = (dx, dy) ->
    # ensuring that we cannot pan outside of the boundaries
    x = (px - dx)
    # cannot pan past the left edge of the page
    x = (if x < 0 then 0 else x)
    y = (py - dy)
    # cannot pan past the top of the page
    y = (if y < 0 then 0 else y)
    if fitToPage
      x2 = gw + x
    else
      x2 = vw + x
    # cannot pan past the width
    x = (if x2 > sw then sw - (vw - sx * 2) else x)
    if fitToPage
      y2 = gh + y
    else
      # height of image could be greater (or less) than the box it fits in
      y2 = vh + y
    # cannot pan below the height
    y = (if y2 > sh then sh - (vh - sy * 2) else y)
    Connection.emitPaperUpdate x / sw, y / sh, null, null

  # When panning finishes
  # @param  {Event} e the mouse event
  panStop = (e) ->
    # nothing to do

  # When dragging for drawing lines starts
  # @param  {number} x the x value of the cursor
  # @param  {number} y the y value of the cursor
  curDragStart = (x, y) ->
    # find the x and y values in relation to the whiteboard
    cx1 = x - s_left - sx + cx
    cy1 = y - s_top - sy + cy
    Connection.emitMakeShape "line", [ cx1 / sw, cy1 / sh, current_colour, current_thickness ]

  # As line drawing drag continues
  # @param  {number} dx the difference between the x value from curDragStart and now
  # @param  {number} dy the difference between the y value from curDragStart and now
  # @param  {number} x  the x value of the cursor
  # @param  {number} y  the y value of the cursor
  # @return {undefined}
  curDragging = (dx, dy, x, y) ->
    # find the x and y values in relation to the whiteboard
    cx2 = x - s_left - sx + cx
    cy2 = y - s_top - sy + cy
    if shift_pressed
      Connection.emitUpdateShape "line", [ cx2 / sw, cy2 / sh, false ]
    else
      path_count++
      if path_count < path_max
        Connection.emitUpdateShape "line", [ cx2 / sw, cy2 / sh, true ]
      else
        path_count = 0
        # save the last path of the line
        line.attrs.path.pop()
        path = line.attrs.path.join(" ")
        line.attr path: (path + "L" + cx1 + " " + cy1)
        # scale the path appropriately before sending
        Connection.emitPublishShape "path", [ line.attrs.path.join(",").toScaledPath(1 / gw, 1 / gh), current_colour, current_thickness ]
        Connection.emitMakeShape "line", [ cx1 / sw, cy1 / sh, current_colour, current_thickness ]
      cx1 = cx2
      cy1 = cy2

  # Drawing line has ended
  # @param  {Event} e the mouse event
  # @return {undefined}
  curDragStop = (e) ->
    path = line.attrs.path
    line = null # any late updates will be blocked by this
    # scale the path appropriately before sending
    Connection.emitPublishShape "path", [ path.join(",").toScaledPath(1 / gw, 1 / gh), current_colour, current_thickness ]

  # Make a line on the whiteboard that could be updated shortly after
  # @param  {number} x         the x value of the line start point as a percentage of the original width
  # @param  {number} y         the y value of the line start point as a percentage of the original height
  # @param  {string} colour    the colour of the shape to be drawn
  # @param  {number} thickness the thickness of the line to be drawn
  # @return {undefined}
  Whiteboard.makeLine = (x, y, colour, thickness) ->
    x *= gw
    y *= gh
    line = paper.path("M" + x + " " + y + "L" + x + " " + y)
    if colour
      line.attr
        stroke: colour
        "stroke-width": thickness
    current_shapes.push line

  # Drawing a line from the list o
  # @param  {string} path      height of the shape as a percentage of the original height
  # @param  {string} colour    the colour of the shape to be drawn
  # @param  {number} thickness the thickness of the line to be drawn
  # @return {undefined}
  drawLine = (path, colour, thickness) ->
    l = paper.path(path.toScaledPath(gw, gh))
    l.attr
      stroke: colour
      "stroke-width": thickness

    current_shapes.push l

  # Updating drawing the line
  # @param  {number} x2  the next x point to be added to the line as a percentage of the original width
  # @param  {number} y2  the next y point to be added to the line as a percentage of the original height
  # @param  {boolean} add true if the line should be added to the current line, false if it should replace the last point
  # @return {undefined}
  Whiteboard.updateLine = (x2, y2, add) ->
    x2 *= gw
    y2 *= gh
    if add
      # if adding to the line
      line.attr path: (line.attrs.path + "L" + x2 + " " + y2)  if line
    else
      # if simply updating the last portion (for drawing a straight line)
      if line
        line.attrs.path.pop()
        path = line.attrs.path.join(" ")
        line.attr path: (path + "L" + x2 + " " + y2)

  # Updating the text from the messages on the socket
  # @param  {string} t        the text of the text object
  # @param  {number} x        the x value of the object as a percentage of the original width
  # @param  {number} y        the y value of the object as a percentage of the original height
  # @param  {number} w        the width of the text box as a percentage of the original width
  # @param  {number} spacing  the spacing between the letters
  # @param  {string} colour   the colour of the text
  # @param  {string} font     the font family of the text
  # @param  {number} fontsize the size of the font (in PIXELS)
  # @return {undefined}
  Whiteboard.updateText = (t, x, y, w, spacing, colour, font, fontsize) ->
    x = x * gw
    y = y * gh
    unless text
      text = paper.text(x, y, "").attr(
        fill: colour
        "font-family": font
        "font-size": fontsize
      )
      text.node.style["text-anchor"] = "start" # force left align
      text.node.style["textAnchor"] = "start" # for firefox, 'cause they like to be different
      current_shapes.push text
    else
      text.attr fill: colour
      cell = text.node
      cell.removeChild cell.firstChild  while cell.hasChildNodes()
      dy = textFlow(t, cell, w, x, spacing, false)
    cur.toFront()

  # Drawing the text on the whiteboard from object
  # @param  {string} t        the text of the text object
  # @param  {number} x        the x value of the object as a percentage of the original width
  # @param  {number} y        the y value of the object as a percentage of the original height
  # @param  {number} w        the width of the text box as a percentage of the original width
  # @param  {number} spacing  the spacing between the letters
  # @param  {string} colour   the colour of the text
  # @param  {string} font     the font family of the text
  # @param  {number} fontsize the size of the font (in PIXELS)
  # @return {undefined}
  drawText = (t, x, y, w, spacing, colour, font, fontsize) ->
    x = x * gw
    y = y * gh
    txt = paper.text(x, y, "").attr(
      fill: colour
      "font-family": font
      "font-size": fontsize
    )
    txt.node.style["text-anchor"] = "start" # force left align
    txt.node.style["textAnchor"] = "start" # for firefox, 'cause they like to be different
    dy = textFlow(t, txt.node, w, x, spacing, false)
    current_shapes.push txt

  # When first dragging the mouse to create the textbox size
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @return {undefined}
  curTextStart = (x, y) ->
    if text
      Connection.emitPublishShape "text", [ textbox.value, text.attrs.x / gw, text.attrs.y / gh, textbox.clientWidth, 16, current_colour, "Arial", 14 ]
      Connection.emitTextDone()
    textbox.value = ""
    textbox.style.visibility = "hidden"
    textx = x
    texty = y
    cx2 = (x - s_left - sx + cx) / sw
    cy2 = (y - s_top - sy + cy) / sh
    Connection.emitMakeShape "rect", [ cx2, cy2, "#000", 1 ]

  # Finished drawing the rectangle that the text will fit into
  # @param  {Event} e the mouse event
  # @return {undefined}
  curTextStop = (e) ->
    rect.hide()  if rect
    tboxw = (e.pageX - textx)
    tboxh = (e.pageY - texty)
    if tboxw >= 14 or tboxh >= 14 # restrict size
      textbox.style.width = tboxw * (gw / sw) + "px"
      textbox.style.visibility = "visible"
      textbox.style["font-size"] = 14 + "px"
      textbox.style["fontSize"] = 14 + "px" # firefox
      textbox.style.color = current_colour
      textbox.value = ""
      x = textx - s_left - sx + cx + 1 # 1px random padding
      y = texty - s_top - sy + cy
      textbox.focus()

      # if you click outside, it will automatically sumbit
      textbox.onblur = (e) ->
        if text
          Connection.emitPublishShape "text", [ @value, text.attrs.x / gw, text.attrs.y / gh, textbox.clientWidth, 16, current_colour, "Arial", 14 ]
          Connection.emitTextDone()
        textbox.value = ""
        textbox.style.visibility = "hidden"

       # if user presses enter key, then automatically submit
       textbox.onkeypress = (e) ->
        if e.keyCode is "13"
          e.preventDefault()
          e.stopPropagation()
          @onblur()

      # update everyone with the new text at every change
      textbox.onkeyup = (e) ->
        @style.color = current_colour
        @value = @value.replace(/\n{1,}/g, " ").replace(/\s{2,}/g, " ")
        Connection.emitUpdateShape "text", [ @value, x / sw, (y + (14 * (sh / gh))) / sh, tboxw * (gw / sw), 16, current_colour, "Arial", 14 ]

  # The server has said the text is finished,
  # so set it to null for the next text object
  # @return {undefined}
  Whiteboard.textDone = ->
    if text
      text = null
      rect.hide()  if rect

  # Creating a rectangle has started
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @return {undefined}
  curRectDragStart = (x, y) ->
    # find the x and y values in relation to the whiteboard
    cx2 = (x - s_left - sx + cx) / sw
    cy2 = (y - s_top - sy + cy) / sh
    Connection.emitMakeShape "rect", [ cx2, cy2, current_colour, current_thickness ]

  # Adjusting rectangle continues
  # @param  {number} dx the difference in the x value at the start as opposed to the x value now
  # @param  {number} dy the difference in the y value at the start as opposed to the y value now
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @param  {Event} e  the mouse event
  # @return {undefined}
  curRectDragging = (dx, dy, x, y, e) ->
    x1 = undefined
    y1 = undefined
    # if shift is pressed, make it a square
    dy = dx  if shift_pressed
    dx = dx / sw
    dy = dy / sh
    # adjust for negative values as well
    unless dx >= 0
      x1 = cx2 + dx
      dx = -dx
    unless dy >= 0
      y1 = cy2 + dy
      dy = -dy
    Connection.emitUpdateShape "rect", [ x1, y1, dx, dy ]

  # When rectangle finished being drawn
  # @param  {Event} e the mouse event
  # @return {undefined}
  curRectDragStop = (e) ->
    r = undefined
    r = rect.attrs  if rect
    Connection.emitPublishShape "rect", [ r.x / gw, r.y / gh, r.width / gw, r.height / gh, current_colour, current_thickness ]  if r
    rect = null

  # Socket response - Make rectangle on canvas
  # @param  {number} x         the x value of the object as a percentage of the original width
  # @param  {number} y         the y value of the object as a percentage of the original height
  # @param  {string} colour    the colour of the object
  # @param  {number} thickness the thickness of the object's line(s)
  # @return {undefined}
  Whiteboard.makeRect = (x, y, colour, thickness) ->
    rect = paper.rect(x * gw, y * gh, 0, 0)
    if colour
      rect.attr
        stroke: colour
        "stroke-width": thickness
    current_shapes.push rect

  # Draw a rectangle on the paper
  # @param  {number} x         the x value of the object as a percentage of the original width
  # @param  {number} y         the y value of the object as a percentage of the original height
  # @param  {number} w         width of the shape as a percentage of the original width
  # @param  {number} h         height of the shape as a percentage of the original height
  # @param  {string} colour    the colour of the object
  # @param  {number} thickness the thickness of the object's line(s)
  # @return {undefined}
  drawRect = (x, y, w, h, colour, thickness) ->
    r = paper.rect(x * gw, y * gh, w * gw, h * gh)
    if colour
      r.attr
        stroke: colour
        "stroke-width": thickness
    current_shapes.push r

  # Socket response - Update rectangle drawn
  # @param  {number} x1 the x value of the object as a percentage of the original width
  # @param  {number} y1 the y value of the object as a percentage of the original height
  # @param  {number} w  width of the shape as a percentage of the original width
  # @param  {number} h  height of the shape as a percentage of the original height
  # @return {undefined}
  Whiteboard.updateRect = (x1, y1, w, h) ->
    if rect
      rect.attr
        x: (x1) * gw
        y: (y1) * gh
        width: w * gw
        height: h * gh

  # When first starting drawing the ellipse
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @return {undefined}
  curEllipseDragStart = (x, y) ->
    # find the x and y values in relation to the whiteboard
    ex = (x - s_left - sx + cx)
    ey = (y - s_top - sy + cy)
    Connection.emitMakeShape "ellipse", [ ex / sw, ey / sh, current_colour, current_thickness ]

  # Make an ellipse on the whiteboard
  # @param  {[type]} cx        the x value of the center as a percentage of the original width
  # @param  {[type]} cy        the y value of the center as a percentage of the original height
  # @param  {string} colour    the colour of the object
  # @param  {number} thickness the thickness of the object's line(s)
  # @return {undefined}
  Whiteboard.makeEllipse = (cx, cy, colour, thickness) ->
    ellipse = paper.ellipse(cx * gw, cy * gh, 0, 0)
    if colour
      ellipse.attr
        stroke: colour
        "stroke-width": thickness
    current_shapes.push ellipse

  # Draw an ellipse on the whiteboard
  # @param  {[type]} cx        the x value of the center as a percentage of the original width
  # @param  {[type]} cy        the y value of the center as a percentage of the original height
  # @param  {[type]} rx        the radius-x of the ellipse as a percentage of the original width
  # @param  {[type]} ry        the radius-y of the ellipse as a percentage of the original height
  # @param  {string} colour    the colour of the object
  # @param  {number} thickness the thickness of the object's line(s)
  # @return {undefined}
  drawEllipse = (cx, cy, rx, ry, colour, thickness) ->
    elip = paper.ellipse(cx * gw, cy * gh, rx * gw, ry * gh)
    if colour
      elip.attr
        stroke: colour
        "stroke-width": thickness
    current_shapes.push elip

  # When first starting to draw an ellipse
  # @param  {number} dx the difference in the x value at the start as opposed to the x value now
  # @param  {number} dy the difference in the y value at the start as opposed to the y value now
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @param  {Event} e   the mouse event
  # @return {undefined}
  curEllipseDragging = (dx, dy, x, y, e) ->
    # if shift is pressed, draw a circle instead of ellipse
    dy = dx  if shift_pressed
    dx = dx / 2
    dy = dy / 2
    # adjust for negative values as well
    x = ex + dx
    y = ey + dy
    dx = (if dx < 0 then -dx else dx)
    dy = (if dy < 0 then -dy else dy)
    Connection.emitUpdateShape "ellipse", [ x / sw, y / sh, dx / sw, dy / sh ]

  # Socket response - Update rectangle drawn
  # @param  {number} x the x value of the object as a percentage of the original width
  # @param  {number} y the y value of the object as a percentage of the original height
  # @param  {number} w width of the shape as a percentage of the original width
  # @param  {number} h height of the shape as a percentage of the original height
  # @return {undefined}
  Whiteboard.updateEllipse = (x, y, w, h) ->
    if ellipse
      ellipse.attr
        cx: x * gw
        cy: y * gh
        rx: w * gw
        ry: h * gh

  # When releasing the mouse after drawing the ellipse
  # @param  {Event} e the mouse event
  # @return {undefined}
  curEllipseDragStop = (e) ->
    attrs = undefined
    attrs = ellipse.attrs  if ellipse
    Connection.emitPublishShape "ellipse", [ attrs.cx / gw, attrs.cy / gh, attrs.rx / gw, attrs.ry / gh, current_colour, current_thickness ]  if attrs
    ellipse = null # late updates will be blocked by this

  # Called when the cursor is moved over the presentation.
  # Sends cursor moving event to server.
  # @param  {Event} e the mouse event
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @return {undefined}
  onCursorMove = (e, x, y) ->
    xLocal = (x - sx - s_left + cx) / sw
    yLocal = (y - sy - s_top + cy) / sh
    Connection.emitMoveCursor xLocal, yLocal

  # Socket response - Update the cursor position on screen
  # @param  {number} x the x value of the cursor as a percentage of the width
  # @param  {number} y the y value of the cursor as a percentage of the height
  # @return {undefined}
  Whiteboard.mvCur = (x, y) ->
    cur.attr
      cx: x * gw
      cy: y * gh

  # Socket response - Clear canvas
  # @return {undefined}
  Whiteboard.clearPaper = ->
    if current_shapes
      current_shapes.forEach (element) ->
        element.remove()

  # Update zoom variables on all clients
  # @param  {Event} event the event that occurs when scrolling
  # @param  {number} delta the speed/direction at which the scroll occurred
  # @return {undefined}
  zoomSlide = (event, delta) ->
    Connection.emitZoom delta

  # Socket response - Update zoom variables and viewbox
  # @param {number} d the delta value from the scroll event
  # @return {undefined}
  Whiteboard.setZoom = (d) ->
    step = 0.05 # step size
    if d < 0
      zoom_level += step # zooming out
    else
      zoom_level -= step # zooming in
    x = cx / sw
    y = cy / sh
    # cannot zoom out further than 100%
    z = (if zoom_level > 1 then 1 else zoom_level)
    # cannot zoom in further than 400% (1/4)
    z = (if z < 0.25 then 0.25 else z)
    # cannot zoom to make corner less than (x,y) = (0,0)
    x = (if x < 0 then 0 else x)
    y = (if y < 0 then 0 else y)
    # cannot view more than the bottom corners
    zz = 1 - z
    x = (if x > zz then zz else x)
    y = (if y > zz then zz else y)
    Connection.emitPaperUpdate x, y, z, z # send update to all clients

  # initPaper()

  # c = document.getElementById("colourView")
  # tc = document.getElementById("thicknessView")
  # cptext = document.getElementById("colourText")
  # ctx = c.getContext("2d")
  # tctx = tc.getContext("2d")

  # s_left = slide_obj.offsetLeft
  # s_top = slide_obj.offsetTop
  # vw = slide_obj.clientWidth
  # vh = slide_obj.clientHeight

  # drawThicknessView default_thickness, default_colour
  # drawColourView default_colour

  # # create colour picker
  # cp = Raphael.colorwheel(-75, -75, 75, default_colour)
  # # hide it
  # cp.raphael.forEach (item) -> item.hide()

  # cpVisible = false

  # $ ->
  #   $("#thickness").slider
  #     value: 1
  #     min: 1
  #     max: 20

  #   $("#thickness").bind "slide", (event, ui) ->
  #     drawThicknessView ui.value, current_colour

  #   # upload without a refresh
  #   $("#uploadForm").submit ->
  #     $("#uploadStatus").text "Uploading..."
  #     $(this).ajaxSubmit
  #       error: (xhr) ->
  #         console.log "Error: " + xhr.status

  #       success: (response) ->

  #     # Have to stop the form from submitting and causing refresh
  #     false

  #   # automatically upload the file if it is chosen
  #   $("#uploadFile").change ->
  #     $("#uploadForm").submit()

  # # when the colour picker colour changes
  # cp.onchange = ->
  #   drawColourView @color()
  #   drawThicknessView current_thickness, @color()

  # # when finished typing a colour into the colour text box
  # cptext.onkeyup = ->
  #   drawColourView @value
  #   drawThicknessView current_thickness, @value

  # when pressing down on a key at anytime
  document.onkeydown = (event) ->
    unless event
      keyCode = window.event.keyCode
    else
      keyCode = event.keyCode
    switch keyCode
      when 16 # shift key
        shift_pressed = true

  # when releasing any key at any time
  document.onkeyup = (event) ->
    unless event
      keyCode = window.event.keyCode
    else
      keyCode = event.keyCode
    switch keyCode
      when 16 # shift key
        shift_pressed = false

  # window.onresize = ->
  #   Whiteboard.windowResized()

  # Whiteboard.windowResized = (div) ->
  #   s_top = slide_obj.offsetTop
  #   s_left = slide_obj.offsetLeft
  #   s_left += $("#presentation")[0].offsetLeft  if div
  #   console.log "window resized"

  # Scales a path string to fit within a width and height of the new paper size
  # @param  {number} w width of the shape as a percentage of the original width
  # @param  {number} h height of the shape as a percentage of the original height
  # @return {string}   the path string after being manipulated to new paper size
  String::toScaledPath = (w, h) ->
    path = undefined
    points = @match(/(\d+[.]?\d*)/g)
    len = points.length
    j = 0

    # go through each point and multiply it by the new height and width
    while j < len
      if j isnt 0
        path += "L" + (points[j] * w) + "," + (points[j + 1] * h)
      else
        path = "M" + (points[j] * w) + "," + (points[j + 1] * h)
      j += 2
    path

  Whiteboard
