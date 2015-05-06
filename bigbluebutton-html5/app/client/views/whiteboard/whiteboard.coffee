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

Template.whiteboard.events
  "click .previousSlide":(event) ->
    BBB.goToPreviousPage()

  "click .nextSlide":(event) ->
    BBB.goToNextPage()

  "click .fullscreenWhiteboardButton": (event, template) ->
    elem = document.getElementById("whiteboard")
    if elem.requestFullscreen
      elem.requestFullscreen()
    else if elem.msRequestFullscreen
      elem.msRequestFullscreen()
    else if elem.mozRequestFullScreen
      elem.mozRequestFullScreen()
    else if elem.webkitRequestFullscreen
      elem.webkitRequestFullscreen()
    $('#whiteboard-paper').addClass('invisible')
    $('#chat').addClass('invisible')
    $('#users').addClass('invisible')
    $('#footer').addClass('invisible')
    $('#navbar').addClass('invisible')
    $('#main').css('padding-top', '0px')
    $('html').css('height', '100%')
    $('html').css('width', '100%')
    $('html').css('overflow', 'hidden')
    $('body').css('height', '100%')
    $('body').css('width', '100%')
    $('body').css('overflow', 'hidden')
    setTimeout () ->
      redrawWhiteboard () ->
        $('#whiteboard-paper').removeClass('invisible')
        $('#whiteboard-paper').addClass('vertically-centered')
    , 100

    # Listens for the fullscreen state change (user leaves fullscreen mode)

    # Chrome
    $('#whiteboard').bind 'webkitfullscreenchange', (e) ->
      if document.webkitFullscreenElement is null
        $('#whiteboard').unbind('webkitfullscreenchange')
        $('#whiteboard-paper').removeClass('vertically-centered')
        $('#chat').removeClass('invisible')
        $('#users').removeClass('invisible')
        $('#footer').removeClass('invisible')
        $('#navbar').removeClass('invisible')
        $('html').css('height', '')
        $('html').css('width', '')
        $('html').css('overflow', '')
        $('body').css('height', '')
        $('body').css('width', '')
        $('body').css('overflow', '')
        $('#main').css('padding-top', '')
        redrawWhiteboard()
    # Firefox
    $(document).bind 'mozfullscreenchange', (e) -> # target is always the document in Firefox
      if document.mozFullScreenElement is null
        $(document).unbind('mozfullscreenchange')
        $('#whiteboard-paper').removeClass('vertically-centered')
        $('#chat').removeClass('invisible')
        $('#users').removeClass('invisible')
        $('#footer').removeClass('invisible')
        $('#navbar').removeClass('invisible')
        $('html').css('height', '')
        $('html').css('width', '')
        $('html').css('overflow', '')
        $('body').css('height', '')
        $('body').css('width', '')
        $('body').css('overflow', '')
        $('#main').css('padding-top', '')
        redrawWhiteboard()
