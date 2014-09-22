Template.whiteboard.rendered = ->
  $(window).resize( ->
    height = $('#whiteboard').height()
    console.log "height = #{height}"
    $('#whiteboard-paper').height((height-$("#whiteboard-navbar").height()-10)+'px')
    $('#whiteboard-paper').width($('#whiteboard-navbar').width())

    # $('#svggroup').html('')

    wpm = Template.slide.whiteboardPaperModel
    wpm.clearCursor()
    Template.slide.createWhiteboardPaper (wpm) ->
      Template.slide.displaySlide wpm
  );
