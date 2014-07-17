# These settings can just be stored locally in session, created at start up
Meteor.startup ->
	console.log "inside startup"
	`this.SessionAmplify = _.extend({}, Session, {
		keys: _.object(_.map(amplify.store(), function(value, key) {
			return [key, JSON.stringify(value)]
		})),
		set: function (key, value) {
			Session.set.apply(this, arguments);
			amplify.store(key, value);
		},
	});`

	Session.setDefault "display_usersList", true
	Session.setDefault "display_navbar", true
	Session.setDefault "display_chatbar", true 
	Session.setDefault "display_whiteboard", false
	Session.setDefault "display_chatPane", true
	Session.setDefault 'inChatWith', "PUBLIC_CHAT"
	Session.setDefault "joinedAt", getTime()
	Session.setDefault "isSharingAudio", false

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
