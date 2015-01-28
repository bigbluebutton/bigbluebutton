@redrawWhiteboard = () ->
  if window.matchMedia('(orientation: portrait)').matches
    $('#whiteboard').height($('#whiteboard').width() * getInSession('slideOriginalHeight') / getInSession('slideOriginalWidth') + $('#whiteboard-navbar').height() + 10)
  else if $('#whiteboard').height() isnt $('#users').height() + 10
    $('#whiteboard').height($('#users').height() + 10)
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  wpm = whiteboardPaperModel
  wpm.clearShapes()
  wpm.clearCursor()
  manuallyDisplayShapes()
  wpm.scale(adjustedDimensions.width, adjustedDimensions.height)
  wpm.createCursor()

  # Shrink height of the slide by 10 pixels. 5 pixels for the above margins, 5 pixels for bottom padding for a total of 10 removed pixels
  $("#whiteboard-paper").height(($("#whiteboard-paper").height()-10) + 'px')

Template.whiteboard.rendered = ->
  if window.matchMedia('(orientation: landscape)').matches
    $("#whiteboard").height(($("#chat").height()) + 'px')
