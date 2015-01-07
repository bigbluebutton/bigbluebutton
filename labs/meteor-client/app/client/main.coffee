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
  "click .audioFeedIcon": (event) ->
    $('.audioFeedIcon').blur()
    toggleSlidingMenu()
    toggleVoiceCall @

  "click .chatBarIcon": (event) ->
    $(".tooltip").hide()
    toggleSlidingMenu()
    toggleChatbar()

  "click .collapseButton": (event) ->
    toggleSlidingMenu()
    $(".tooltip").hide()
    $('.collapseButton').blur()
    $('.myNavbar').css('z-index', 1032)

  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()

  "click .lowerHand": (event) ->
    $(".tooltip").hide()
    toggleSlidingMenu()
    Meteor.call('userLowerHand', getInSession("meetingId"), getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  "click .muteIcon": (event) ->
    $(".tooltip").hide()
    toggleMic @

  "click .raiseHand": (event) ->
    #Meteor.log.info "navbar raise own hand from client"
    console.log "navbar raise own hand from client"
    $(".tooltip").hide()
    toggleSlidingMenu()
    Meteor.call('userRaiseHand', getInSession("meetingId"), getInSession("userId"), getInSession("userId"), getInSession("authToken"))
    # "click .settingsIcon": (event) ->
    #   alert "settings"

  "click .signOutIcon": (event) ->
    $('.signOutIcon').blur()
    if window.matchMedia('(orientation: portrait)').matches
      if $('#dialog').dialog('option', 'height') isnt 450
        $('#dialog').dialog('option', 'width', '100%')
        $('#dialog').dialog('option', 'height', 450)
    else
      if $('#dialog').dialog('option', 'height') isnt 115
        $('#dialog').dialog('option', 'width', 270)
        $('#dialog').dialog('option', 'height', 115)
    $("#dialog").dialog("open")
  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()
  # "click .settingsIcon": (event) ->
  #   alert "settings"

  "click .usersListIcon": (event) ->
    $(".tooltip").hide()
    toggleSlidingMenu
    toggleUsersList()

  "click .videoFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleCam @

  "click .whiteboardIcon": (event) ->
    $(".tooltip").hide()
    toggleSlidingMenu
    toggleWhiteBoard()

  "mouseout #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonLarge")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonSmall")

  "mouseover #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonSmall")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonLarge")

Template.slidingMenu.events
  'click .audioFeedIcon': (event) ->
    $('.audioFeedIcon').blur()
    toggleSlidingMenu()
    toggleVoiceCall @
    if BBB.amISharingAudio()
      $('.navbarTitle').css('width', '70%')
    else
      $('.navbarTitle').css('width', '55%')

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

Template.main.helpers
	setTitle: ->
		document.title = "BigBlueButton #{window.getMeetingName() ? 'HTML5'}"

Template.main.rendered = ->
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
    position:
      my: 'right top'
      at: 'right bottom'
      of: '.signOutIcon'
  )

  $(window).resize( ->
    $('#dialog').dialog('close')
  )

  $('#darkened-screen').click () ->
    toggleSlidingMenu()

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()

Template.recordingStatus.rendered = ->
  $('button[rel=tooltip]').tooltip()
