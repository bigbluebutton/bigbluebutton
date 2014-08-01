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

	SessionAmplify.set "display_usersList", true
	SessionAmplify.set "display_navbar", true
	SessionAmplify.set "display_chatbar", true 
	SessionAmplify.set "display_whiteboard", true
	SessionAmplify.set "display_chatPane", true
	SessionAmplify.set 'inChatWith', "PUBLIC_CHAT"
	SessionAmplify.set "joinedAt", getTime()
	SessionAmplify.set "isSharingAudio", false

	@myTabs = new WatchValue()
	@myTabs.updateValue [
		{isActive:true, name:"Public", class: "publicChatTab"}
		{isActive:false, name:"Options", class: "optionsChatTab"}
	]

	@whiteboardPaperModel = new WhiteboardPaperModel('whiteboard-paper')

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
		userLogout getInSession("meetingId"), getInSession("userId"), true
	"click .hideNavbarIcon": (event) ->
		toggleNavbar()
	"click .settingsIcon": (event) ->
		alert "settings"
	"click .raiseHand": (event) -> 
		Meteor.call('userRaiseHand', @id)
	"click .whiteboardIcon": (event) ->
		toggleWhiteBoard()

Template.makeButton.rendered = ->
   $('button[rel=tooltip]').tooltip()
		
# Gets called last in main template, just an easy place to print stuff out
Handlebars.registerHelper "doFinalStuff", ->
    console.log "-----Doing Final Stuff-----"
