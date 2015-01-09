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
