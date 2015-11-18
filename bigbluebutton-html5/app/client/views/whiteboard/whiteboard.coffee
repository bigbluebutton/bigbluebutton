# scale the whiteboard to adapt to the resized window
@scaleWhiteboard = (callback) ->
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  wpm = whiteboardPaperModel
  wpm.scale(adjustedDimensions.width, adjustedDimensions.height)
  if callback
    callback()

Template.whiteboard.helpers
  presentationProgress: ->
    currentPresentation = Meteor.Presentations.findOne({'presentation.current':true})
    currentSlideNum = Meteor.Slides.findOne({'presentationId': currentPresentation?.presentation.id, 'slide.current':true})?.slide.num
    totalSlideNum = Meteor.Slides.find({'presentationId': currentPresentation?.presentation.id})?.count()
    console.log('slide', currentSlideNum)
    if currentSlideNum isnt undefined
      return "#{currentSlideNum}/#{totalSlideNum}"
    else
      return ''
  isPollStarted: ->
    if BBB.isPollGoing(getInSession('userId'))
      return true
    else
      return false

Template.whiteboard.events
  'click .whiteboardFullscreenButton': (event, template) ->
    enterWhiteboardFullscreen()

  'click .exitFullscreenButton': (event, template) ->
    if document.exitFullscreen
      document.exitFullscreen()
    else if document.mozCancelFullScreen
      document.mozCancelFullScreen()
    else if document.webkitExitFullscreen
      document.webkitExitFullscreen()

  'click .sadEmojiButton.inactiveEmojiButton': (event) ->
    if $('.sadEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "sad")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .happyEmojiButton.inactiveEmojiButton': (event) ->
    if $('.happyEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "happy")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .confusedEmojiButton.inactiveEmojiButton': (event) ->
    if $('.confusedEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "confused")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .neutralEmojiButton.inactiveEmojiButton': (event) ->
    if $('.neutralEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "neutral")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .awayEmojiButton.inactiveEmojiButton': (event) ->
    if $('.awayEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "away")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .raiseHandEmojiButton.inactiveEmojiButton': (event) ->
    if $('.raiseHandEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "raiseHand")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .activeEmojiButton': (event) ->
    if $('.activeEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), getInSession('userId'), getInSession('userId'), getInSession('authToken'), "none")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .FABTriggerButton': (event) ->
    $('.FABTriggerButton').blur()
    toggleEmojisFAB()

Template.whiteboardControls.events
  'click .whiteboard-buttons-slide > .prev':(event) ->
    BBB.goToPreviousPage()

  'click .whiteboard-buttons-slide > .next':(event) ->
    BBB.goToNextPage()

  'click .switchSlideButton': (event) ->
    $('.tooltip').hide()

Template.polling.events
  'click .pollButtons': (event) ->
    _key = @.label
    _id = @.answer
    BBB.sendPollResponseMessage(_key, _id)

Template.polling.rendered = ->
  scaleWhiteboard()

Template.polling.destroyed = ->
  setTimeout(scaleWhiteboard, 0)

Template.whiteboardControls.rendered = ->
  scaleWhiteboard()

Template.whiteboardControls.destroyed = ->
  setTimeout(scaleWhiteboard, 0)

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

  # whiteboard element needs to be available
  Meteor.NotificationControl = new NotificationControl('notificationArea')

  $(document).foundation() # initialize foundation javascript

Template.presenterUploaderControl.created = ->
  this.isOpen = new ReactiveVar(false);
  this.files = new ReactiveList();

Template.presenterUploaderControl.events
  'click .js-open':(event, template) ->
    template.isOpen.set(true);
  'click .js-close':(event, template) ->
    template.isOpen.set(false);

Template.presenterUploaderControl.helpers
  isOpen: -> Template.instance().isOpen.get()
  files: -> Template.instance().files.fetch()
