define [ "jquery", "raphael", "cs!chat/connection", "colorwheel" ], ($, Raphael, Connection) ->

  Whiteboard = {}

  # slide_obj = document.getElementById("slide")
  # textbox = document.getElementById("area")

  # $("#area").autosize()

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

  # When first starting drawing the ellipse
  # @param  {number} x the x value of cursor at the time in relation to the left side of the browser
  # @param  {number} y the y value of cursor at the time in relation to the top of the browser
  # @return {undefined}
  curEllipseDragStart = (x, y) ->
    # find the x and y values in relation to the whiteboard
    ex = (x - s_left - sx + cx)
    ey = (y - s_top - sy + cy)
    Connection.emitMakeShape "ellipse", [ ex / sw, ey / sh, current_colour, current_thickness ]

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

  # Update zoom variables on all clients
  # @param  {Event} event the event that occurs when scrolling
  # @param  {number} delta the speed/direction at which the scroll occurred
  # @return {undefined}
  zoomSlide = (event, delta) ->
    Connection.emitZoom delta

  # c = document.getElementById("colourView")
  # tc = document.getElementById("thicknessView")
  # cptext = document.getElementById("colourText")
  # ctx = c.getContext("2d")
  # tctx = tc.getContext("2d")

  # s_left = slide_obj.offsetLeft
  # s_top = slide_obj.offsetTop
  # vw = slide_obj.clientWidth
  # vh = slide_obj.clientHeight


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

  Whiteboard
