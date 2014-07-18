# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	`this.SessionAmplify = _.extend({}, Session, {
		keys: _.object(_.map(amplify.store(), function(value, key) {
			return [key, JSON.stringify(value)]
		})),
		set: function (key, value) {
			Session.set.apply(this, arguments);
			amplify.store(key, value);
		},
	});`

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
		# wipe session
		Session.keys = {}
		Session.keyDeps = {}
		Session.keyDepsDeps = {}
		# # wipe persisted session
		SessionAmplify.keys = {}
		SessionAmplify.keyDeps = {}
		SessionAmplify.keyDepsDeps = {}
		Meteor.validUser = false # invalidate user
		Router.go('logout'); # navigate to logout
	"click .hideNavbarIcon": (event) ->
		toggleNavbar()
	"click .settingsIcon": (event) ->
		alert "settings"
		
# Gets called last in main template, just an easy place to print stuff out
Handlebars.registerHelper "doFinalStuff", ->
    console.log "-----Doing Final Stuff-----"
