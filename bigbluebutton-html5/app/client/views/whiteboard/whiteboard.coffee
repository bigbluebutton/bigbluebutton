# scale the whiteboard to adapt to the resized window
@scaleWhiteboard = (callback) ->
  adjustedDimensions = scaleSlide(getInSession('slideOriginalWidth'), getInSession('slideOriginalHeight'))
  if whiteboardPaperModel?
    whiteboardPaperModel.scale(adjustedDimensions.width, adjustedDimensions.height)

  if callback
    callback()

Template.whiteboard.helpers
  presentationProgress: ->
    currentPresentation = Meteor.Presentations.findOne({'presentation.current':true})
    currentSlideNum = Meteor.Slides.findOne({'presentationId': currentPresentation?.presentation.id, 'slide.current':true})?.slide.num
    totalSlideNum = Meteor.Slides.find({'presentationId': currentPresentation?.presentation.id})?.count()
    # console.log('slide', currentSlideNum)
    if currentSlideNum isnt undefined
      return "#{currentSlideNum}/#{totalSlideNum}"
    else
      return ''

  isPollStarted: ->
    if BBB.isPollGoing(BBB.getMyUserId())
      return true
    else
      return false

  hasNoPresentation: ->
    Meteor.Presentations.findOne({'presentation.current':true})

  forceSlideShow: ->
    reactOnSlideChange()

  clearSlide: ->
    #clear the slide
    whiteboardPaperModel?.removeAllImagesFromPaper()

    # hide the cursor
    whiteboardPaperModel?.cursor?.remove()


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

Template.emojiDisplay.events
  'click .sadEmojiButton.inactiveEmojiButton': (event) ->
    if $('.sadEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "sad")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .happyEmojiButton.inactiveEmojiButton': (event) ->
    if $('.happyEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "happy")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .confusedEmojiButton.inactiveEmojiButton': (event) ->
    if $('.confusedEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "confused")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .neutralEmojiButton.inactiveEmojiButton': (event) ->
    if $('.neutralEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "neutral")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .awayEmojiButton.inactiveEmojiButton': (event) ->
    if $('.awayEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "away")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .raiseHandEmojiButton.inactiveEmojiButton': (event) ->
    if $('.raiseHandEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "raiseHand")
      $('.FABTriggerButton').blur()
      toggleEmojisFAB()

  'click .activeEmojiButton': (event) ->
    if $('.activeEmojiButton').css('opacity') is '1'
      BBB.setEmojiStatus(BBB.getMeetingId(), BBB.getMyUserId(), BBB.getMyUserId(), BBB.getMyAuthToken(), "none")
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
  setTimeout(scaleWhiteboard, 0)

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
  this.files = new ReactiveList({
    sort: (a, b) ->
      # Put the ones who still uploading first
      (a.isUploading == b.isUploading) ? 0 : a.isUploading ? -1 : 1;
  });
  this.presentations = Meteor.Presentations.find({},
  {
    sort: {'presentation.current': -1, 'presentation.name': 1}
    fields: {'presentation': 1}
  });

fakeUpload = (file, list) ->
  setTimeout (->
    file.uploadedSize = file.uploadedSize + (Math.floor(Math.random() * file.size + file.uploadedSize)/10)
    unless file.size > file.uploadedSize
      file.uploadedSize = file.size
      file.isUploading = false

    list.update(file.name, file)

    if file.isUploading == true
      fakeUpload(file, list)
    else
      # TODO: Here we should remove and update te presentation on mongo
      list.remove(file.name)
  ), 200

Template.presenterUploaderControl.events
  'click .js-open':(event, template) ->
    template.isOpen.set(true);

  'click .js-close':(event, template) ->
    template.isOpen.set(false);

  'dragover [data-dropzone]':(e) ->
    e.preventDefault()
    $(e.currentTarget).addClass('hover')

  'dragleave [data-dropzone]':(e) ->
    e.preventDefault()
    $(e.currentTarget).removeClass('hover')

  'drop [data-dropzone], change [data-dropzone] > input[type="file"]':(e, template) ->
    e.preventDefault();
    files = (e.originalEvent.dataTransfer || e.originalEvent.target).files

    _.each(files, (file) ->
      file.isUploading = true;
      file.uploadedSize = 0;
      file.percUploaded = 0;

      template.files.insert(file.name, file)
      fakeUpload(file, template.files)
    )

Template.presenterUploaderControl.helpers
  isOpen: -> Template.instance().isOpen.get()
  files: -> Template.instance().files.fetch()
  presentations: -> Template.instance().presentations.fetch().map((x) -> x.presentation)

Template.presenterUploaderControlFileListItem.helpers
  percUploaded: -> Math.round((this.uploadedSize / this.size) * 100)

Template.presenterUploaderControlPresentationListItem.events
  'click [data-action-show]':(event, template) ->
    console.info('Should show the file `' + this.name + '`');

  'click [data-action-delete]':(event, template) ->
    console.info('Should delete the file `' + this.name + '`');
