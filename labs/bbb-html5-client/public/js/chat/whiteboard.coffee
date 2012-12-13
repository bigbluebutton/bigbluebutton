define [ "jquery", "raphael", "cs!chat/connection", "colorwheel" ], ($, Raphael, Connection) ->

  Whiteboard = {}

  # slide_obj = document.getElementById("slide")
  # textbox = document.getElementById("area")

  # $("#area").autosize()

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

  # $ ->
  #   $("#thickness").slider
  #     value: 1
  #     min: 1
  #     max: 20

  #   $("#thickness").bind "slide", (event, ui) ->
  #     drawThicknessView ui.value, current_colour

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
