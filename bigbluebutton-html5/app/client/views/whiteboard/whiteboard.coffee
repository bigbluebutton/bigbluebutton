# redraw the whiteboard to adapt to the resized window
@redrawWhiteboard = (callback) ->
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  wpm = whiteboardPaperModel
  wpm.clearShapes()
  wpm.clearCursor()
  manuallyDisplayShapes()
  wpm.scale(adjustedDimensions.width, adjustedDimensions.height)
  wpm.createCursor()
  if callback
    callback()

Template.whiteboard.helpers
  presentationProgress: ->
    currentPresentation = Meteor.Presentations.findOne({'presentation.current':true})
    currentSlideNum = Meteor.Slides.findOne({'presentationId': currentPresentation?.presentation.id, 'slide.current':true})?.slide.num
    totalSlideNum = Meteor.Slides.find({'presentationId': currentPresentation?.presentation.id})?.count()
    if currentSlideNum isnt undefined
      return "#{currentSlideNum}/#{totalSlideNum}"
    else
      return ''
  
  isPollStarted: ->
    poll = getInSession('poll')
    if poll is true
      return true
    else
      return


Template.whiteboard.events
  'click .previousSlide':(event) ->
    BBB.goToPreviousPage()

  'click .nextSlide':(event) ->
    BBB.goToNextPage()

  'click .switchSlideButton': (event) ->
    $('.tooltip').hide()

  'click .whiteboardFullscreenButton': (event, template) ->
    enterWhiteboardFullscreen()

  'click .exitFullscreenButton': (event, template) ->
    if document.exitFullscreen
      document.exitFullscreen()
    else if document.mozCancelFullScreen
      document.mozCancelFullScreen()
    else if document.webkitExitFullscreen
      document.webkitExitFullscreen()

  'click .raiseHand': (event) ->
    BBB.raiseHand(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'))

  'click .lowerHand': (event) ->
    BBB.lowerHand(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'))

Template.whiteboard.rendered = ->
  $('#whiteboard').resizable
    handles: 'e'
    minWidth: 150
    resize: () ->
      adjustChatInputHeight()
    start: () ->
      if $('#chat').width() / $('#panels').width() > 0.2 # chat shrinking can't make it smaller than one fifth of the whiteboard-chat area
        $('#whiteboard').resizable('option', 'maxWidth', $('#panels').width() - 200) # gives the chat enough space (200px)
      else
        $('#whiteboard').resizable('option', 'maxWidth', $('#whiteboard').width())
    stop: () ->
      $('#whiteboard').css('width', 100 * $('#whiteboard').width() / $('#panels').width() + '%') # transforms width to %
      $('#whiteboard').resizable('option', 'maxWidth', null)
