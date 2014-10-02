# --------------------------------------------------------------------------------------------
# Public methods on server
# All these method must first authenticate the user before it calls the private function counterpart below
# which sends the request to bbbApps. If the method is modifying the media the current user is sharing,
# you should perform the request before sending the request to bbbApps. This allows the user request to be performed
# immediately, since they do not require permission for things such as muting themsevles. 
# --------------------------------------------------------------------------------------------
Meteor.methods
	# I did not simply loop through all users and call the 'publishMuteRequest' because that function
	# always validates the credentials of the requester. This is a waste of resources when applying it to every user.
	# We can validate the muter first, then mute all users individually
	# Perhaps there should be a way to send a mute request to bbbApps for several users, instead of an individual request for each user (bandwidth)
	MuteAllUsers: (meetingId, requesterUserId, requester_id) ->
		console.log "MuteAllUsers server method"
		muter = Meteor.Users.findOne({'meetingId': meetingId, 'userId': requesterUserId, _id: requester_id})

		if muter?.presenter? and muter.presenter # or if they are a moderator?
			users = Meteor.Users.find({}).fetch()
		
			for mutee in users
				# check if user isnt muted, then continue. If they are already muted you can skip them
				message =
					"payload":
						"userid": mutee.userId
						"meeting_id": meetingId
						"mute": mutedBoolean
						"requester_id": muter.userId
					"header": 
						"timestamp": new Date().getTime()
						"name": "mute_user_request"
						"version": "0.0.1"

				publish Meteor.config.redis.channels.toBBBApps.voice, message
				updateVoiceUser {'user_id': mutee._id, talking:false, muted:true}

	userShareAudio: (meetingId, userId, user_id) ->
		updateVoiceUser {'user_id': user_id, 'talking':false, 'joined': true, 'muted':false}
		#TODO we need to send a message to bbb-apps about it

	userStopAudio: (meetingId, userId, user_id, requesterUserId, requester_id) ->
		console.log "publishing a user left voice request for #{userId} in #{meetingId}"
		user = Meteor.Users.findOne({'meetingId': meetingId, 'userId': userId, '_id': user_id})
		requester = Meteor.Users.findOne({'meetingId': meetingId, 'userId': requesterUserId, '_id': requester_id})
		if user? and requester? and ((user._id is requester._id) or requester.presenter)
			message =
				"payload":
					"userid": user.userId
					"meeting_id": user.meetingId
				"header":
					"timestamp": new Date().getTime()
					"name": "user_left_voice_request"
					"version": "0.0.1"

			publish Meteor.config.redis.channels.toBBBApps.voice, message
			updateVoiceUser {'user_id': user_id, talking:false, joined: true, muted:false}
		else
			console.log "did not have enough information to send a mute_user_request"

	# Verifies muter exists, provided proper credentials, and has permission to mute the user
	publishMuteRequest: (meetingId, mutee_id, requesterUserId, requester_id, mutedBoolean) ->
		console.log "publishing a user mute #{mutedBoolean} request for #{mutee_id}"
		
		mutee = Meteor.Users.findOne({'meetingId': meetingId, _id: mutee_id})
		muter = Meteor.Users.findOne({'meetingId': meetingId, 'userId': requesterUserId, _id: requester_id})
		if mutee? and muter?
			message =
				"payload":
					"userid": mutee.userId
					"meeting_id": meetingId
					"mute": mutedBoolean
					"requester_id": muter.userId
				"header": 
					"timestamp": new Date().getTime()
					"name": "mute_user_request"
					"version": "0.0.1"

			publish Meteor.config.redis.channels.toBBBApps.voice, message
			updateVoiceUser {'user_id': mutee._id, talking:false, muted:true}
			# 
		else
			console.log "did not have enough information to send a mute_user_request"

	# meetingId: the meetingId which both users are in 
	# user_id: the _id of the user to have their hand lowered
	# loweredByUserId: userId of person lowering
	# loweredBy_id: _id of person lowering
	userLowerHand: (meetingId, toLowerUser_Id, loweredByUserId, loweredBy_id) ->
		requester = Meteor.Users.findOne({'meetingId': meetingId, 'userId': loweredByUserId, '_id': loweredBy_id})
		if requester?
			# Allow if person lowering the hand is the presenter, or they're lowering their own hand
			unless requester.user.presenter or loweredBy_id is toLowerUser_Id or requester.role is "MODERATOR"
				return

			console.log "publishing a userLowerHand event: #{userId}--by=#{requester._id}"
			toLower = Meteor.Users.findOne({'meetingId': meetingId, '_id': toLowerUser_Id})
			if toLower?
				message =
					"payload":
						"userid": toLower.userId
						"meeting_id": meetingId
						"raise_hand": false
						"lowered_by": loweredByUserId
					"header":
						"timestamp": new Date().getTime()
						"name": "user_lowered_hand_message"
						"version": "0.0.1"

				# publish to pubsub
				publish Meteor.config.redis.channels.toBBBApps.users, message

	# meetingId: the meetingId which both users are in 
	# user_id: the _id of the user to have their hand raised
	# loweredByUserId: userId of person raising
	# loweredBy_id: _id of person raising
	userRaiseHand: (meetingId, user_id, raisedByUserId, raisedBy_id) ->
		requester = Meteor.Users.findOne({'meetingId': meetingId, 'userId': raisedByUserId, '_id': raisedBy_id})
		if requester?
			# Allow if person raising the hand is the presenter, or they're raising their own hand
			unless requester.user.presenter or raisedBy_id is user_id or requester.role is "MODERATOR"
				return

			console.log "publishing a userRaiseHand event: #{userId}--by=#{requester._id}"
			toRaise = Meteor.Users.findOne({'meetingId': meetingId, '_id': user_id})
			if toRaise?
				message =
					"payload":
						"userid": toRaise.userId
						"meeting_id": meetingId
						"raise_hand": true
						"raised_by": raisedByUserId
					"header":
						"timestamp": new Date().getTime()
						"name": "user_raised_hand_message"
						"version": "0.0.1"

				# publish to pubsub
				publish Meteor.config.redis.channels.toBBBApps.users, message

	userLogout: (meetingId, userId, user_id) ->
		console.log "a user is logging out:" + userId
		u = Meteor.Users.findOne({meetingId: meetingId, _id: user_id, userId: userId})
		if u? 
			#remove from the collection and dispatch a message to redis
			removeUserFromMeeting meetingId, u.userId, u.user_id

	# userToBeKicked: the _id of the user who was selected to be kicked
	# kickerUserId: the userId of the user kicking another user
	# kicker_id: the _id of the user kicking another user
	userKick: (meetingId, userToBeKicked, kickerUserId, kicker_id) ->
		kicker = Meteor.Users.findOne({meetingId: meetingId, _id: kicker_id, userId: kickerUserId})
		toKick = Meteor.Users.findOne({meetingId: meetingId, _id: userToBeKicked})
		if kicker? and toKick? and kicker.presenter
			#remove from the collection and dispatch a message to redis
			removeUserFromMeeting meetingId, toKick.userId, toKick.user_id

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
# Only callable from server
# You must need a user's public and private id
@removeUserFromMeeting = (meetingId, userId, user_id) ->
	console.log "#{toKick.userId} is being kicked"
	console.log "----removed user[" + toKick + "] from " + meetingId
	u = Meteor.Users.findOne({'userId': userId, _id: user_id})
	if u?
		Meteor.Users.remove(user._id) # Should this only happen once we get the server's response?

		console.log "\n\n sending a user_leaving_request for #{meetingId}:#{user._id}"
		message =
			"payload":
				"meeting_id": meetingId
				"userid": user.userId
			"header":
				"timestamp": new Date().getTime()
				"name": "user_leaving_request"
				"version": "0.0.1"

		if user.userId? and meetingId?
			publish Meteor.config.redis.channels.toBBBApps.users, message
		else
			console.log "did not have enough information to send a user_leaving_request"

#update a voiceUser - a helper method
@updateVoiceUser = (voiceUserObject) ->
	if voiceUserObject?.user_id?
		console.log "I am updating the voiceUserObject with the following: " + JSON.stringify voiceUserObject

		u = Meteor.Users.findOne _id: voiceUserObject.user_id
		if u?
			if voiceUserObject.talking?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.talking':voiceUserObject.talking}}, {multi: false}) # talking
			if voiceUserObject.joined?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.joined':voiceUserObject.joined}}, {multi: false}) # joined
			if voiceUserObject.locked?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.locked':voiceUserObject.locked}}, {multi: false}) # locked
			if voiceUserObject.muted?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.muted':voiceUserObject.muted}}, {multi: false}) # muted
			if voiceUserObject.listenOnly?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.listenOnly':voiceUserObject.listenOnly}}, {multi: false}) # muted
		else
			console.log "ERROR! did not find such voiceUser!"

@addUserToCollection = (meetingId, user) ->
	userId = user.userid
	#check if the user is already in the meeting
	unless Meteor.Users.findOne({userId:userId, meetingId: meetingId})?
		entry =
			meetingId: meetingId
			userId: userId
			user:
				userid: user.userid
				presenter: user.presenter
				name: user.name
				phone_user: user.phone_user
				raise_hand: user.raise_hand
				has_stream: user.has_stream
				role: user.role
				listenOnly: user.listenOnly
				extern_userid: user.extern_userid
				permissions: user.permissions
				locked: user.locked
				time_of_joining: user.timeOfJoining
				voiceUser:
					web_userid: user.voiceUser.web_userid
					callernum: user.voiceUser.callernum
					userid: user.voiceUser.userid
					talking: user.voiceUser.talking
					joined: user.voiceUser.joined
					callername: user.voiceUser.callername
					locked: user.voiceUser.locked
					muted: user.voiceUser.muted
				webcam_stream: user.webcam_stream

	id = Meteor.Users.insert(entry)
	console.log "added user id=[#{id}]:#{user.name}. Users.size is now #{Meteor.Users.find({meetingId: meetingId}).count()}"
