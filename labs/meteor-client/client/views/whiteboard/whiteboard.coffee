Template.whiteboard.rendered = ->
	$(window).resize( ->
		height = $('#whiteboard').height()
		console.log "height = #{height}"
		$('#whiteboard-paper').height((height-$("#whiteboard-navbar").height()-10)+'px')

		# $('#svggroup').html('')

		Template.slide.whiteboardPaperModel._updateContainerDimensions()

		wpm = Template.slide.whiteboardPaperModel
		wpm.clearShapes()
		wpm = Template.slide.whiteboardPaperModel
		Template.slide.displaySlide(wpm)
		Template.slide.manuallyDisplayShapes()
	);