# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	Session.setDefault "display_usersList", true
	Session.setDefault "display_navbar", true
	Session.setDefault "display_chatbar", true 
	Session.setDefault "display_whiteboard", false
	Session.setDefault "display_chatPane", true
	Session.setDefault 'inChatWith', "PUBLIC_CHAT"
	Session.setDefault "joinedAt", getTime()
	Session.setDefault "isSharingAudio", false

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
		Meteor.call("userLogout", Session.get("meetingId"), Session.get("userId"))
		Session.set "display_navbar", false # needed to hide navbar when the layout template renders
		Router.go('logout');
	"click .hideNavbarIcon": (event) ->
		toggleNavbar()
	"click .settingsIcon": (event) ->
		alert "settings"
		
# Gets called last in main template, just an easy place to print stuff out
Handlebars.registerHelper "doFinalStuff", ->
    console.log "-----Doing Final Stuff-----"
    console.log "session: " + Session.get "joinedAt"

