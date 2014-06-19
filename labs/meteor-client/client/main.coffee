# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	Session.set "display_usersList", true
	Session.set "display_navbar", true
	Session.set "display_chat", false # false until respective template is created
	Session.set "display_whiteboard", false # false until respective template is created

	Meteor.subscribe 'users', 'fd9f3cd6ee945175f276098945d37cd4f46f7b4f-1403121629339'

Template.header.events
	"click .usersListIcon": (event) ->
		toggleUsersList()
	"click .chatBarIcon": (event) ->
		alert "chat"
	"click .videoFeedIcon": (event) ->
		toggleCam @ 
	"click .audioFeedIcon": (event) ->
		toggleMic @
	"click .signOutIcon": (event) ->
		alert "signout"
	"click .hideNavbarIcon": (event) ->
		toggleNavbar()
	"click .settingsIcon": (event) ->
		alert "settings"