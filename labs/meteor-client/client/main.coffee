Template.footer.helpers
  getFooterString: ->
    # info = Meteor.call('getServerInfo')
    year = "YEAR" #info.getBuildYear()
    month = "MONTH" #info.getBuildMonth()
    day = "DAY" #info.getBuildDay()
    # version = "VERSION_XXXX" #info.getBuildVersion()
    version = getInSession "bbbServerVersion"
    copyrightYear = (new Date()).getFullYear()
    link = "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>"
    foot = "(c) #{copyrightYear} BigBlueButton Inc. [build #{version}-#{year}-#{month}-#{day}] - For more information visit #{link}"

Template.header.events
  "click .usersListIcon": (event) ->
    toggleUsersList()
  "click .chatBarIcon": (event) ->
    toggleChatbar()
  "click .videoFeedIcon": (event) ->
    toggleCam @ 
  "click .audioFeedIcon": (event) ->
    toggleVoiceCall @
  "click .muteIcon": (event) ->
    toggleMic @
  "click .signOutIcon": (event) ->
    response = confirm('Are you sure you want to exit?')
    if response
      userLogout getInSession("meetingId"), getInSession("userId"), true

  "click .hideNavbarIcon": (event) ->
    toggleNavbar()
  # "click .settingsIcon": (event) ->
  #   alert "settings"
  "click .raiseHand": (event) ->
    console.log "navbar raise own hand from client"
    Meteor.call('userRaiseHand', getInSession("meetingId"), getInSession("DBID"), getInSession("userId"), getInSession("DBID") )
  "click .lowerHand": (event) ->
    Meteor.call('userLowerHand', getInSession("meetingId"), getInSession("DBID"), getInSession("userId"), getInSession("DBID") )
  "click .whiteboardIcon": (event) ->
    toggleWhiteBoard()
  "mouseover #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonSmall")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonLarge")
  "mouseout #navbarMinimizedButton": (event) ->
    $("#navbarMinimizedButton").removeClass("navbarMinimizedButtonLarge")
    $("#navbarMinimizedButton").addClass("navbarMinimizedButtonSmall")

Template.recordingStatus.rendered = ->
  $('button[rel=tooltip]').tooltip()

Template.main.helpers
	setTitle: ->
		document.title = "BigBlueButton #{window.getMeetingName() ? 'HTML5'}"

Template.makeButton.rendered = ->
  $('button[rel=tooltip]').tooltip()

# These settings can just be stored locally in session, created at start up
Meteor.startup ->
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
  setInSession "isSharingAudio", false
  setInSession "inChatWith", 'PUBLIC_CHAT'
  setInSession "messageFontSize", 12
  setInSession "isMuted", false
