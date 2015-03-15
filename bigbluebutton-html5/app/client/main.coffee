settingsIconPath = 'M17.41,20.395l-0.778-2.723c0.228-0.2,0.442-0.414,0.644-0.643l2.721,0.778c0.287-0.418,0.534-0.862,0.755-1.323l-2.025-1.96c0.097-0.288,0.181-0.581,0.241-0.883l2.729-0.684c0.02-0.252,0.039-0.505,0.039-0.763s-0.02-0.51-0.039-0.762l-2.729-0.684c-0.061-0.302-0.145-0.595-0.241-0.883l2.026-1.96c-0.222-0.46-0.469-0.905-0.756-1.323l-2.721,0.777c-0.201-0.228-0.416-0.442-0.644-0.643l0.778-2.722c-0.418-0.286-0.863-0.534-1.324-0.755l-1.96,2.026c-0.287-0.097-0.581-0.18-0.883-0.241l-0.683-2.73c-0.253-0.019-0.505-0.039-0.763-0.039s-0.51,0.02-0.762,0.039l-0.684,2.73c-0.302,0.061-0.595,0.144-0.883,0.241l-1.96-2.026C7.048,3.463,6.604,3.71,6.186,3.997l0.778,2.722C6.736,6.919,6.521,7.134,6.321,7.361L3.599,6.583C3.312,7.001,3.065,7.446,2.844,7.907l2.026,1.96c-0.096,0.288-0.18,0.581-0.241,0.883l-2.73,0.684c-0.019,0.252-0.039,0.505-0.039,0.762s0.02,0.51,0.039,0.763l2.73,0.684c0.061,0.302,0.145,0.595,0.241,0.883l-2.026,1.96c0.221,0.46,0.468,0.905,0.755,1.323l2.722-0.778c0.2,0.229,0.415,0.442,0.643,0.643l-0.778,2.723c0.418,0.286,0.863,0.533,1.323,0.755l1.96-2.026c0.288,0.097,0.581,0.181,0.883,0.241l0.684,2.729c0.252,0.02,0.505,0.039,0.763,0.039s0.51-0.02,0.763-0.039l0.683-2.729c0.302-0.061,0.596-0.145,0.883-0.241l1.96,2.026C16.547,20.928,16.992,20.681,17.41,20.395zM11.798,15.594c-1.877,0-3.399-1.522-3.399-3.399s1.522-3.398,3.399-3.398s3.398,1.521,3.398,3.398S13.675,15.594,11.798,15.594zM27.29,22.699c0.019-0.547-0.06-1.104-0.23-1.654l1.244-1.773c-0.188-0.35-0.4-0.682-0.641-0.984l-2.122,0.445c-0.428-0.364-0.915-0.648-1.436-0.851l-0.611-2.079c-0.386-0.068-0.777-0.105-1.173-0.106l-0.974,1.936c-0.279,0.054-0.558,0.128-0.832,0.233c-0.257,0.098-0.497,0.22-0.727,0.353L17.782,17.4c-0.297,0.262-0.568,0.545-0.813,0.852l0.907,1.968c-0.259,0.495-0.437,1.028-0.519,1.585l-1.891,1.06c0.019,0.388,0.076,0.776,0.164,1.165l2.104,0.519c0.231,0.524,0.541,0.993,0.916,1.393l-0.352,2.138c0.32,0.23,0.66,0.428,1.013,0.6l1.715-1.32c0.536,0.141,1.097,0.195,1.662,0.15l1.452,1.607c0.2-0.057,0.399-0.118,0.596-0.193c0.175-0.066,0.34-0.144,0.505-0.223l0.037-2.165c0.455-0.339,0.843-0.747,1.152-1.206l2.161-0.134c0.152-0.359,0.279-0.732,0.368-1.115L27.29,22.699zM23.127,24.706c-1.201,0.458-2.545-0.144-3.004-1.345s0.143-2.546,1.344-3.005c1.201-0.458,2.547,0.144,3.006,1.345C24.931,22.902,24.328,24.247,23.127,24.706z'

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
  "click .audioFeedIcon": (event) ->
    if getInSession('webrtc_notification_is_displayed') is false # prevents the notification from displaying until the previous one is hidden
      if !navigator.webkitGetUserMedia # verifies if the browser supports WebRTC
        setInSession 'webrtc_notification_is_displayed', true
        pp = new Raphael('browser-icon-container', 35, 35)
        pp.path(settingsIconPath).attr({fill: "#000", stroke: "none"})
        $('.notification.ui-widget-content p').css('font-size', '11px') # to make sure the text fits the dialog box
        $('#notification-text').html("Sorry,<br/>your browser doesn't support WebRTC")
        $('#notification').dialog('open')
        setTimeout () -> # waits 2 sec, then hides the notification
          $('#notification').dialog('close')
          $('.audioFeedIcon').blur()
          setTimeout () -> # waits 0.5 sec (time to hide the notification), then removes the icons
            pp.remove()
            setInSession 'webrtc_notification_is_displayed', false
          , 500
        , 2000
    $('.audioFeedIcon').blur()
    #toggleSlidingMenu()
    toggleVoiceCall @
    if BBB.amISharingAudio()
      $('.navbarTitle').css('width', $('#navbar').width() - 358.4)
    else
      $('.navbarTitle').css('width', $('#navbar').width() - 409.6)

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

  "click .lowerHand": (event) ->
    $(".tooltip").hide()
    Meteor.call('userLowerHand', getInSession("meetingId"), getInSession("userId"), getInSession("userId"), getInSession("authToken"))

  "click .muteIcon": (event) ->
    $(".tooltip").hide()
    toggleMic @

  "click .raiseHand": (event) ->
    #Meteor.log.info "navbar raise own hand from client"
    console.log "navbar raise own hand from client"
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
  # "click .settingsIcon": (event) ->
  #   alert "settings"

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
    open: (event, ui) ->
      $('.ui-widget-overlay').bind 'click', () ->
        if isMobile()
          $("#dialog").dialog('close')
    position:
      my: 'right top'
      at: 'right bottom'
      of: '.signOutIcon'
  )

  $("#notification").dialog(
    modal: false
    draggable: false
    resizable: false
    autoOpen: false
    dialogClass: 'no-close no-titlebar notification'
    show:
      effect: "blind"
      duration: 500
    ,
    hide:
      effect: "blind"
      duration: 500
    position:
      my: 'left top'
      at: 'left bottom'
      of: '.audioFeedIcon'
  )

  $(window).resize( ->
    $('#dialog').dialog('close')
  )

  $('#shield').click () ->
    toggleSlidingMenu()

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()

Template.recordingStatus.rendered = ->
  $('button[rel=tooltip]').tooltip()
