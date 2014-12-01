# Helper to load javascript libraries from the BBB server
loadLib = (libname) ->
  successCallback = ->

  retryMessageCallback = (param) ->
    #Meteor.log.info "Failed to load library", param
    console.log "Failed to load library", param

  Meteor.Loader.loadJs("http://#{window.location.hostname}/client/lib/#{libname}", successCallback, 10000).fail(retryMessageCallback)

recalculateLayout = ->
  console.log "recalculateLayout"
  usersDisplayed = getInSession "display_usersList"
  whiteboardDisplayed = getInSession "display_whiteboard"
  chatDisplayed = getInSession "display_chatbar"

  # 25 x 50 x 25
  if usersDisplayed and whiteboardDisplayed and chatDisplayed
    $("#users").width('20%')
    $("#whiteboard").width('48%')
    $("#chat").width('20%')
  else
    # 33 x 66
    if usersDisplayed and whiteboardDisplayed
      $("#users").width('30%')
      $("#whiteboard").width('63%')
    else
      if chatDisplayed and whiteboardDisplayed
        $("#chat").width('30%')
        $("#whiteboard").width('63%')
      else
        # full screen slides
        if whiteboardDisplayed and !chatDisplayed and !usersDisplayed
          console.log "fullscreen"
          $("#whiteboard").width($(window).width()-5)
          $("#whiteboard").height($(window).height()-10)
        else
          if chatDisplayed
            $("#chat").width('24%')
          if usersDisplayed
            $("#users").width('24%')

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

  setInSession "display_usersList", true
  setInSession "display_navbar", true
  setInSession "display_chatbar", true
  setInSession "display_whiteboard", true
  setInSession "display_chatPane", true
  setInSession "joinedAt", getTime()
  setInSession "inChatWith", 'PUBLIC_CHAT'
  setInSession "messageFontSize", 12
  setInSession "dateOfBuild", Meteor.config?.dateOfBuild or "UNKNOWN DATE"
  setInSession "bbbServerVersion", Meteor.config?.bbbServerVersion or "UNKNOWN VERSION"
  setInSession "displayChatNotifications", true

Template.footer.helpers
  getFooterString: ->
    # info = Meteor.call('getServerInfo')
    dateOfBuild = getInSession 'dateOfBuild'
    version = getInSession "bbbServerVersion"
    copyrightYear = (new Date()).getFullYear()
    link = "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>"
    foot = "(c) #{copyrightYear} BigBlueButton Inc. [build #{version} - #{dateOfBuild}] - For more information visit #{link}"

Template.header.events
  "click .audioFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleVoiceCall @

  "click .chatBarIcon": (event) ->
    $(".tooltip").hide()
    toggleChatbar()
    recalculateLayout()

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
    $("#dialog").dialog("open")
  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()
  # "click .settingsIcon": (event) ->
  #   alert "settings"

  "click .usersListIcon": (event) ->
    $(".tooltip").hide()
    toggleUsersList()
    recalculateLayout()

  "click .videoFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleCam @

  "click .whiteboardIcon": (event) ->
    $(".tooltip").hide()
    toggleWhiteBoard()
    recalculateLayout()

  "mouseout #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonLarge")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonSmall")

  "mouseover #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonSmall")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonLarge")

Template.main.helpers
	setTitle: ->
		document.title = "BigBlueButton #{window.getMeetingName() ? 'HTML5'}"

Template.main.rendered = ->
  $("#dialog").dialog(
    modal: true
    draggable: false
    resizable: false
    autoOpen: false
    height: 115
    width: 270
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

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()

Template.recordingStatus.rendered = ->
  $('button[rel=tooltip]').tooltip()
