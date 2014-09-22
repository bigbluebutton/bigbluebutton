Template.whiteboard.rendered = ->
  $(window).resize( ->
    height = $('#whiteboard').height()
    console.log "height = #{height}"
    $('#whiteboard-paper').height((height-$("#whiteboard-navbar").height()-10)+'px')

    # $('#svggroup').html('')

    wpm = Template.slide.whiteboardPaperModel
    wpm.clearShapes()
    wpm.clearCursor()
    wpm._updateContainerDimensions()
    wpm = Template.slide.whiteboardPaperModel
    Template.slide.displaySlide(wpm)
    Template.slide.manuallyDisplayShapes()
  );
