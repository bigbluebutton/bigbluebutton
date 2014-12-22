Template.whiteboard.rendered = ->
  $(window).resize( ->
    redrawWhiteboard()
  )

@redrawWhiteboard = () ->
  currentSlide = getCurrentSlideDoc()
  pic = new Image()
  pic.onload = ->
    if window.matchMedia('(orientation: portrait)').matches
      $('#whiteboard').height($('#whiteboard').width() * this.height / this.width + $('#whiteboard-navbar').height() + 10)
    adjustedDimensions = scaleSlide(this.width, this.height)
    wpm = whiteboardPaperModel
    wpm.setAdjustedDimensions(adjustedDimensions.width, adjustedDimensions.height)
    wpm.clearShapes()
    wpm.clearCursor()
    manuallyDisplayShapes()
    wpm.scale(adjustedDimensions.width, adjustedDimensions.height)
    wpm.createCursor()
  pic.src = currentSlide?.slide?.png_uri
