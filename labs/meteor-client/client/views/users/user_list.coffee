Template.usersList.helpers
	getMeetingSize: -> # Retreieve the number of users in the chat, or "error" string
		Meteor.Users.find().count()

Template.usersList.events
	'click #MuteAllUsers': (event) ->
		console.log "MuteAllUsers click handler"
		Meteor.call 'MuteAllUsers', getInSession("userId")
