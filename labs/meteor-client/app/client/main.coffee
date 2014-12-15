# Helper to load javascript libraries from the BBB server
loadLib = (libname) ->
  successCallback = ->

  retryMessageCallback = (param) ->
    #Meteor.log.info "Failed to load library", param
    console.log "Failed to load library", param

  Meteor.Loader.loadJs("http://#{window.location.hostname}/client/lib/#{libname}", successCallback, 10000).fail(retryMessageCallback)

recalculateLayout = ->
  usersDisplayed = getInSession "display_usersList"
  whiteboardDisplayed = getInSession "display_whiteboard"
  chatDisplayed = getInSession "display_chatbar"
  # If only one module is selected (presentation), it should take up
  # the entire width of the screen. If it's two modules, each module
  # should take up 50% of the screen. If it's 3 modules (25%, 50%, 25%)

  console.log "recalculateLayout #{usersDisplayed} #{whiteboardDisplayed} #{chatDisplayed}"

  # clear the default width
  # $("#users").removeAttr('style')#.css("width","")
  # $("#whiteboard").removeAttr('style')#.css("width","")
  # $("#chat").removeAttr('style')#.css("width","")

  if whiteboardDisplayed
    if chatDisplayed and usersDisplayed
      $("#users").removeClass("halfScreen").addClass("quarterScreen")
      $("#whiteboard").removeClass("fullScreenPresentation").addClass("halfScreen")
      $("#chat").removeClass("halfScreen").addClass("quarterScreen")
      displaySlide @whiteboardPaperModel
    else
      if chatDisplayed or usersDisplayed
        if chatDisplayed
          $("#whiteboard").removeClass("fullScreenPresentation").addClass("halfScreen")
          $("#chat").removeClass("quarterScreen").addClass("halfScreen")
        if usersDisplayed
          $("#whiteboard").removeClass("fullScreenPresentation").addClass("halfScreen")
          $("#users").removeClass("quarterScreen").addClass("halfScreen")
      else
        console.log "fullscreen"
        $("#whiteboard").removeClass("halfScreen").addClass("fullScreenPresentation")
  else
    if chatDisplayed
      $("#chat").removeClass("quarterScreen").addClass("halfScreen")
      return
    if usersDisplayed
      $("#users").removeClass("quarterScreen").addClass("halfScreen")
      return

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
    $('.audioFeedIcon').blur()
    toggleVoiceCall @

  "click .chatBarIcon": (event) ->
    $(".tooltip").hide()
    toggleChatbar()
    #recalculateLayout()

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
    #recalculateLayout()

  "click .videoFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleCam @

  "click .whiteboardIcon": (event) ->
    $(".tooltip").hide()
    toggleWhiteBoard()
    #recalculateLayout()

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

Template.header.rendered = ->
  $('.collapseButton').on 'click', () ->
    $(".tooltip").hide()
    if $('.collapseSection').css('display') is 'block'
      $('.collapseSection').css({'display': 'none'})
      $('.navbarTitle').css({ 'margin-left': 'auto', 'margin-right': 'auto', 'width': '80%' })
      $('.collapseButton > i').removeClass('glyphicon-chevron-left')
      $('.collapseButton > i').addClass('glyphicon-chevron-right')
    else
      $('.collapseSection').css({'display': 'block'})
      $('.navbarTitle').css({ 'width': '30%' })
      $('.collapseButton > i').removeClass('glyphicon-chevron-right')
      $('.collapseButton > i').addClass('glyphicon-chevron-left')
