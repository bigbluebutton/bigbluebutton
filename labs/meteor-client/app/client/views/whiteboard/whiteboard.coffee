Template.whiteboard.rendered = ->
  $(window).resize( ->
    currentSlide = getCurrentSlideDoc()

    pic = new Image()
    pic.onload = ->
      originalWidth = this.width
      originalHeight = this.height

      boardWidth = $("#whiteboard").width()

      boardHeight = $("#whiteboard").height() - $("#whiteboard-navbar").height() - 10

      if originalWidth <= originalHeight
        adjustedWidth = boardHeight * originalWidth / originalHeight
        $('#whiteboard-paper').width(adjustedWidth)
        if boardWidth < adjustedWidth
          adjustedHeight = boardHeight * boardWidth / adjustedWidth
          adjustedWidth = boardWidth
        else
          adjustedHeight = boardHeight
        $("#whiteboard-paper").height(adjustedHeight)
      else
        adjustedHeight = boardWidth * originalHeight / originalWidth
        $('#whiteboard-paper').height(adjustedHeight)
        if boardHeight < adjustedHeight
          adjustedWidth = boardWidth * boardHeight / adjustedHeight
          adjustedHeight = boardHeight
        else
          adjustedWidth = boardWidth
        $("#whiteboard-paper").width(adjustedWidth)

      wpm = whiteboardPaperModel
      wpm.clearShapes()
      wpm.clearCursor()
      manuallyDisplayShapes()

      #wpm._updateContainerDimensions()

      wpm.scale(adjustedWidth, adjustedHeight)
      wpm.createCursor()

    pic.src = currentSlide?.slide?.png_uri
  );
