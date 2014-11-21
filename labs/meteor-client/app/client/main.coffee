Template.footer.helpers
  getFooterString: ->
    # info = Meteor.call('getServerInfo')
    dateOfBuild = getInSession 'dateOfBuild'
    version = getInSession "bbbServerVersion"
    copyrightYear = (new Date()).getFullYear()
    link = "<a href='http://bigbluebutton.org/' target='_blank'>http://bigbluebutton.org</a>"
    foot = "(c) #{copyrightYear} BigBlueButton Inc. [build #{version} - #{dateOfBuild}] - For more information visit #{link}"

Template.header.events
  "click .usersListIcon": (event) ->
    $(".tooltip").hide()
    toggleUsersList()
  "click .chatBarIcon": (event) ->
    $(".tooltip").hide()
    toggleChatbar()
  "click .videoFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleCam @
  "click .audioFeedIcon": (event) ->
    $(".tooltip").hide()
    toggleVoiceCall @
  "click .muteIcon": (event) ->
    $(".tooltip").hide()
    toggleMic @
  "click .signOutIcon": (event) ->
    $("#dialog").dialog("open")
  "click .hideNavbarIcon": (event) ->
    $(".tooltip").hide()
    toggleNavbar()
  # "click .settingsIcon": (event) ->
  #   alert "settings"
  "click .raiseHand": (event) ->
    console.log "navbar raise own hand from client"
    $(".tooltip").hide()
    Meteor.call('userRaiseHand', getInSession("meetingId"), getInSession("DBID"), getInSession("userId"), getInSession("DBID") )
  "click .lowerHand": (event) ->
    $(".tooltip").hide()
    Meteor.call('userLowerHand', getInSession("meetingId"), getInSession("DBID"), getInSession("userId"), getInSession("DBID") )
  "click .whiteboardIcon": (event) ->
    $(".tooltip").hide()
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

@grabAllDBID = ->
  array = []
  for u in Meteor.Users.find().fetch()
    array.push(u._id)
  return array

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

  Meteor.autorun ->
    if Meteor.status().connected
      console.log("connected")
      uid = getInSession("userId")
      # Obtain user info here. for testing. should be moved somewhere else later
      Meteor.call "getMyInfo", uid, (error, result) -> #TODO should try to get rid of this?
        if error? then console.log "error:" + error
        else
          Meteor.subscribe 'users', getInSession('meetingId'), getInSession("userId"), -> # callback for after users have been loaded on client
            Meteor.subscribe 'chat', getInSession('meetingId'), getInSession("userId"), ->
              Meteor.subscribe 'shapes', getInSession('meetingId'), ->
                Meteor.subscribe 'slides', getInSession('meetingId'), ->
                  Meteor.subscribe 'meetings', getInSession('meetingId'), ->
                    Meteor.subscribe 'presentations', getInSession('meetingId'), ->
                      Meteor.call "getMyInfo", getInSession("userId"), (error, result) ->
                        console.log "managed to reconnect successfully"
                        setInSession("DBID", result.DBID)
                        setInSession("userName", result.name)

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
