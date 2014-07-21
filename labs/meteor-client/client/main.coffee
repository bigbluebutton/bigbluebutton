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
	SessionAmplify.set "display_whiteboard", false
	SessionAmplify.set "display_chatPane", true
	SessionAmplify.set 'inChatWith', "PUBLIC_CHAT"
	SessionAmplify.set "joinedAt", getTime()
	SessionAmplify.set "isSharingAudio", false

	@myTabs = new WatchValue()
	@myTabs.updateValue [
		{isActive:true, name:"Public", class: "publicChatTab"}
		{isActive:false, name:"Options", class: "optionsChatTab"}
	]

Template.header.events
	"click .usersListIcon": (event) ->
		toggleUsersList()
	"click .chatBarIcon": (event) ->
		toggleChatbar()
	"click .videoFeedIcon": (event) ->
		toggleCam @ 
	"click .audioFeedIcon": (event) ->
		toggleMic @
	"click .signOutIcon": (event) ->
		Meteor.call("userLogout", getInSession("meetingId"), getInSession("userId"))
		setInSession "display_navbar", false # needed to hide navbar when the layout template renders
		# wipe important session data
		setInSession("userId", null)
		setInSession("meetingId", null)
		setInSession("currentChatId", null)
		setInSession("meetingName", null)
		setInSession("bbbServerVersion", null)
		setInSession("userName", null) 
		# invalidate user
		setInSession("validUser", false) 
		# navigate to logout
		Router.go('logout')
	"click .hideNavbarIcon": (event) ->
		toggleNavbar()
	"click .settingsIcon": (event) ->
		alert "settings"
		
# Gets called last in main template, just an easy place to print stuff out
Handlebars.registerHelper "doFinalStuff", ->
    console.log "-----Doing Final Stuff-----"
