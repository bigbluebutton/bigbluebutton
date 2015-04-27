# this method gets called from either mobile or desktop UI
# this method will adjust the UI to compensate for the new audio button
displayAudioSelectionMenu = ({isMobile} = {}) ->
  isMobile ?= false
  $('.joinAudioButton').blur()

  if isMobile
    toggleSlidingMenu()
    $('.navbarTitle').css('width', '55%')

  # pop open the dialog allowing users to choose the audio options
  if isLandscapeMobile()
    $('.joinAudio-dialog').addClass('landscape-mobile-joinAudio-dialog')
  else
    $('.joinAudio-dialog').addClass('desktop-joinAudio-dialog')

  $("#joinAudioDialog").dialog("open")

# helper function to reuse some code for the handling of audio join
onAudioJoinHelper = () ->
  # if the microphone is locked (lock settings), the viewer is only
  # allowed to join the audio as listenOnly.
  if BBB.isMyMicLocked()
    introToAudio(null, isListenOnly: true)
  else
    displayAudioSelectionMenu(isMobile: isMobile())

# Helper to load javascript libraries from the BBB server
loadLib = (libname) ->
  successCallback = ->

  retryMessageCallback = (param) ->
    #Meteor.log.info "Failed to load library", param
    console.log "Failed to load library", param

  Meteor.Loader.loadJs("http://#{window.location.hostname}/client/lib/#{libname}", successCallback, 10000).fail(retryMessageCallback)

# These settings can just be stored locally in session, created at start up
Meteor.startup ->
  # Load SIP libraries before the application starts
  loadLib('sip.js')
  loadLib('bbb_webrtc_bridge_sip.js')
  loadLib('bbblogger.js')

  @SessionAmplify = _.extend({}, Session,
    keys: _.object(_.map(amplify.store(), (value, key) ->
      [
        key
        JSON.stringify(value)
      ]
    ))
    set: (key, value) ->
      Session.set.apply this, arguments
      amplify.store key, value
      return
  )
#
Template.footer.helpers
  getFooterString: ->
    info = getBuildInformation()
    foot = "(c) #{info.copyrightYear} BigBlueButton Inc. [build #{info.bbbServerVersion} - #{info.dateOfBuild}] - For more information visit #{info.link}"

Template.header.events
  "click .joinAudioButton": (event) ->
    if !isWebRTCAvailable()
      notification_WebRTCNotSupported()
    else
      onAudioJoinHelper()

  "click .chatBarIcon": (event) ->
    $(".tooltip").hide()
    toggleChatbar()

  "click .collapseSlidingMenuButton": (event) ->
    toggleSlidingMenu()
    $(".tooltip").hide()
    $('.collapseSlidingMenuButton').blur()
    $('.myNavbar').css('z-index', 1032)

  'click .collapseNavbarButton': (event) ->
    $(".tooltip").hide()
    $('.collapseNavbarButton').blur()
    toggleNavbarCollapse()

  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()

  "click .leaveAudioButton": (event) ->
    exitVoiceCall event

  "click .lowerHand": (event) ->
    $(".tooltip").hide()
    Meteor.call('userLowerHand', getInSession("meetingId"), getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  "click .muteIcon": (event) ->
    $(".tooltip").hide()
    toggleMic @

  "click .raiseHand": (event) ->
    $(".tooltip").hide()
    Meteor.call('userRaiseHand', getInSession("meetingId"), getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  # "click .settingsIcon": (event) ->
    #   alert "settings"

  "click .signOutIcon": (event) ->
    $('.signOutIcon').blur()
    if isLandscapeMobile()
      $('.logout-dialog').addClass('landscape-mobile-logout-dialog')
    else
      $('.logout-dialog').addClass('desktop-logout-dialog')
    $("#dialog").dialog("open")

  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()

  "click .usersListIcon": (event) ->
    $(".tooltip").hide()
    toggleUsersList()

  "click .videoFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleCam @

  "click .whiteboardIcon": (event) ->
    $(".tooltip").hide()
    toggleWhiteBoard()

  "mouseout #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonLarge")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonSmall")

  "mouseover #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonSmall")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonLarge")

Template.slidingMenu.events
  'click .joinAudioButton': (event) ->
    onAudioJoinHelper()

  'click .chatBarIcon': (event) ->
    $('.tooltip').hide()
    toggleSlidingMenu()
    toggleChatbar()

  'click .lowerHand': (event) ->
    $('.tooltip').hide()
    toggleSlidingMenu()
    Meteor.call('userLowerHand', getInSession('meetingId'), getInSession('userId'), getInSession('userId'), getInSession('authToken'))

  'click .raiseHand': (event) ->
    console.log 'navbar raise own hand from client'
    $('.tooltip').hide()
    toggleSlidingMenu()
    Meteor.call('userRaiseHand', getInSession("meetingId"), getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  'click .usersListIcon': (event) ->
    $('.tooltip').hide()
    toggleSlidingMenu()
    toggleUsersList()

  'click .whiteboardIcon': (event) ->
    $('.tooltip').hide()
    toggleSlidingMenu()
    toggleWhiteBoard()

  'click .collapseButton': (event) ->
    $('.tooltip').hide()
    toggleSlidingMenu()
    $('.collapseButton').blur()

  "click .leaveAudioButton": (event) ->
    exitVoiceCall event
    toggleSlidingMenu()

Template.main.helpers
  setTitle: ->
    document.title = "BigBlueButton #{window.getMeetingName() ? 'HTML5'}"

Template.main.rendered = ->
  # the initialization code for the dialog presenting the user with microphone+listen only options
  $("#joinAudioDialog").dialog(
    modal: true
    draggable: false
    resizable: false
    autoOpen: false
    dialogClass: 'no-close logout-dialog joinAudioDialog'
    buttons: [
      {
        text: 'Cancel'
        click: () ->
          $(this).dialog("close")
          $(".tooltip").hide()
        class: 'btn btn-xs btn-default joinAudioDialogButton'
      }
    ]
    open: (event, ui) ->
      $('.ui-widget-overlay').bind 'click', () ->
        if isMobile()
          $("#joinAudioDialog").dialog('close')
    position: { my: "center", at: "center", of: window }
  )

  # jQuery click events are handled here. Meteor click handlers don't get called.
  # we pass in a named boolean parameter the whether we wish to join audio as listen only or not
  $("#microphone").click ->
    introToAudio @, isListenOnly: false

  $("#listen_only").click ->
    introToAudio @, isListenOnly: true

  $("#dialog").dialog(
    modal: true
    draggable: false
    resizable: false
    autoOpen: false
    dialogClass: 'no-close logout-dialog'
    buttons: [
      {
        text: 'Yes'
        click: () ->
          userLogout getInSession("meetingId"), getInSession("userId"), true
          $(this).dialog("close")
        class: 'btn btn-xs btn-primary active'
      }
      {
        text: 'No'
        click: () ->
          $(this).dialog("close")
          $(".tooltip").hide()
        class: 'btn btn-xs btn-default'
      }
    ]
    open: (event, ui) ->
      $('.ui-widget-overlay').bind 'click', () ->
        if isMobile()
          $("#dialog").dialog('close')
    position:
      my: 'right top'
      at: 'right bottom'
      of: '.signOutIcon'
  )

  Meteor.NotificationControl = new NotificationControl()

  $(window).resize( ->
    $('#dialog').dialog('close')
    $('#joinAudioDialog').dialog('close')
  )

  $('#shield').click () ->
    toggleSlidingMenu()

  if Meteor.config.app.autoJoinAudio
    onAudioJoinHelper()

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()

Template.recordingStatus.rendered = ->
  $('button[rel=tooltip]').tooltip()
