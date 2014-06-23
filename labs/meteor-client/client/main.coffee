# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	Session.set "display_usersList", true
	Session.set "display_navbar", true
	Session.set "display_chatbar", false # false until respective template is created
	Session.set "display_whiteboard", false # false until respective template is created

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
		#alert "signout"
		Meteor.call("userLogout", Session.get("meetingId"), Session.get("userId"))
		Session.set "display_navbar", false # needed to hide navbar when the layout template renders
		Router.go('logout');
	"click .hideNavbarIcon": (event) ->
		toggleNavbar()
	"click .settingsIcon": (event) ->
		alert "settings"
		