# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	Session.set "display_usersList", true
	Session.set "display_navbar", true
	Session.set "display_chatbar", true 
	Session.set "display_whiteboard", false
	Session.set "display_chatPane", true
	Session.set 'inChatWith', "PUBLIC_CHAT"

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
	

