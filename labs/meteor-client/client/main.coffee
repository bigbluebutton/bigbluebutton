# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	Session.set "display_usersList", true
	Session.set "display_navbar", true
	Session.set "display_chatbar", true 
	Session.set "display_whiteboard", false
	Session.set "display_chatPane", true
	addNewTab "Public", true, "publicChatTab"
	addNewTab "Options", false, "optionsChatTab"
	Session.set "chatTabsReactivity", 0 # any value will work here

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
	console.log JSON.stringify(ChatbarTabs)

	# userFields = ("Username: #{entry.user.name} - userId: #{entry.userId} - _id: #{entry._id}" for entry in Meteor.Users.find().fetch()) # comprehension is awesome!
	# console.log entry for entry in userFields

	# # console.log _.pluck
	# #us = _.pluck Meteor.Users.find().fetch(), '_id'
	# #console.log JSON.stringify us

	# info = Meteor.Users.find({}, {fields: "user.name": 1, "userId": 1, "_id", 1}).fetch()
	# # userFields = ("Username: #{entry.user.name} - userId: #{entry.userId} - _id: #{entry._id}" for entry in Meteor.Users.find().fetch()) # comprehension is awesome!
	# # console.log entry for entry in userFields

	# console.log "---------------------------"


