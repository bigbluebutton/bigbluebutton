# redraw the whiteboard to adapt to the resized window
@redrawWhiteboard = () ->
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  wpm = whiteboardPaperModel
  wpm.clearShapes()
  wpm.clearCursor()
  manuallyDisplayShapes()
  wpm.scale(adjustedDimensions.width, adjustedDimensions.height)
  wpm.createCursor()

Template.whiteboard.events
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
    setTimeout(redrawWhiteboard, 100)
    $('#chat').addClass('invisible')
    $('#users').addClass('invisible')
    $('#footer').addClass('invisible')
    $('#navbar').addClass('invisible')
    $('html').css('height', '100%')
    $('html').css('width', '100%')
    $('html').css('overflow', 'hidden')
    $('body').css('height', '100%')
    $('body').css('width', '100%')
    $('body').css('overflow', 'hidden')

    # Listens for the fullscreen state change (user leaves fullscreen mode)

    # Chrome
    $('#whiteboard').bind 'webkitfullscreenchange', (e) ->
      if document.webkitFullscreenElement is null
        $('#whiteboard').unbind('webkitfullscreenchange')
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
        redrawWhiteboard()
    # Firefox
    $(document).bind 'mozfullscreenchange', (e) -> # target is always the document in Firefox
      if document.mozFullScreenElement is null
        $(document).unbind('mozfullscreenchange')
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
        redrawWhiteboard()
