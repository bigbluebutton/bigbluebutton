Template.whiteboard.rendered = ->
  $(window).resize( ->
    redrawWhiteboard()
  )

  Tracker.autorun () ->
    if getInSession('display_chatbar') isnt undefined
      redrawWhiteboard()
    if getInSession('display_usersList') isnt undefined
      redrawWhiteboard()
    if getInSession('display_whiteboard') isnt undefined
      redrawWhiteboard()

@redrawWhiteboard = () ->
  currentSlide = getCurrentSlideDoc()
  pic = new Image()
  pic.onload = ->
    adjustedDimensions = scaleSlide(this.width, this.height)
    wpm = whiteboardPaperModel
    wpm.setAdjustedDimensions(adjustedDimensions.width, adjustedDimensions.height)
    wpm.clearShapes()
    wpm.clearCursor()
    manuallyDisplayShapes()
    wpm.scale(adjustedDimensions.width, adjustedDimensions.height)
    wpm.createCursor()

  pic.src = currentSlide?.slide?.png_uri
