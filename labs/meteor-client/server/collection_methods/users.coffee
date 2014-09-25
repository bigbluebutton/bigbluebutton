Meteor.methods
	addUserToCollection: (meetingId, user) ->
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

	# I did not simply loop through all users and call the 'publishMuteRequest' because that function
	# always validates the credentials of the requester. This is a waste of resources when applying it to every user.
	# We can validate the muter first, then mute all users individually
	MuteAllUsers: (meetingId, requesterUserId, requester_id) ->
		console.log "MuteAllUsers server method"
		muter = Meteor.Users.findOne({'meetingId': meetingId, 'userId': requesterUserId, _id: requester_id})

		if muter?.presenter? and muter.presenter
			users = Meteor.Users.find({}).fetch()
		
			for mutee in users
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

				Meteor.call('publish', Meteor.config.redis.channels.toBBBApps.voice, message)
				Meteor.Users.update({_id: mutee._id}, {$set:{'user.voiceUser.talking':false, 'user.voiceUser.muted':true}}, {multi: false})

	userShareAudio: (meetingId, userId, user_id) ->
		updateVoiceUser meetingId, {'user_id': user_id, 'talking':false, 'joined': true, 'muted':false}
		#TODO should we also send a message to bbb-apps about it?

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

			Meteor.call('publish', Meteor.config.redis.channels.toBBBApps.voice, message)
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

			Meteor.call('publish', Meteor.config.redis.channels.toBBBApps.voice, message)
			Meteor.Users.update({_id: mutee._id}, {$set:{'user.voiceUser.talking':false, 'user.voiceUser.muted':true}}, {multi: false})
			# 
		else
			console.log "did not have enough information to send a mute_user_request"

	# meetingId: the meetingId which both users are in 
	# user_id: the _id of the user to have their hand lowered
	# loweredByUserId: userId of person lowering
	# loweredBy_id: _id of person lowering
	userLowerHand: (meetingId, user_id, loweredByUserId, loweredBy_id) ->
		requester = Meteor.Users.findOne({'meetingId': meetingId, 'userId': loweredByUserId, '_id': loweredBy_id})
		if requester?
			# Allow if person lowering the hand is the presenter, or they're lowering their own hand
			unless requester.user.presenter or loweredBy_id is user_id
				return

			console.log "publishing a userLowerHand event: #{userId}--by=#{requester._id}"

			# update Users collection
			toLower = Meteor.Users.findOne({'meetingId': meetingId, '_id': user_id})

			Meteor.Users.update(_id: toLower._id, {$set: {'user.raise_hand': false}}, {multi: false})
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

			#publish to pubsub
			Meteor.call('publish', Meteor.config.redis.channels.toBBBApps.users, message)

	# meetingId: the meetingId which both users are in 
	# user_id: the _id of the user to have their hand raised
	# loweredByUserId: userId of person raising
	# loweredBy_id: _id of person raising
	userRaiseHand: (meetingId, user_id, loweredByUserId, loweredBy_id) ->
		requester = Meteor.Users.findOne({'meetingId': meetingId, 'userId': loweredByUserId, '_id': loweredBy_id})
		if requester?
			# Allow if person raising the hand is the presenter, or they're raising their own hand
			unless requester.user.presenter or loweredBy_id is user_id
				return

			console.log "publishing a userLowerHand event: #{userId}--by=#{requester._id}"

			# update Users collection
			toLower = Meteor.Users.findOne({'meetingId': meetingId, '_id': user_id})

			Meteor.Users.update(_id: toLower._id, {$set: {'user.raise_hand': true}}, {multi: false})
			message =
				"payload":
					"userid": toLower.userId
					"meeting_id": meetingId
					"raise_hand": true
					"lowered_by": loweredByUserId
				"header":
					"timestamp": new Date().getTime()
					"name": "user_raised_hand_message"
					"version": "0.0.1"

			#publish to pubsub
			Meteor.call('publish', Meteor.config.redis.channels.toBBBApps.users, message)

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
		Meteor.Users.remove(user._id)

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
			Meteor.call('publish', Meteor.config.redis.channels.toBBBApps.users, message)
		else
			console.log "did not have enough information to send a user_leaving_request"

#update a voiceUser - a helper method
updateVoiceUser: (voiceUserObject) ->
	if voiceUserObject?.user_id?
		console.log "I am updating the voiceUserObject with the following: " + JSON.stringify voiceUserObject

		u = Meteor.Users.findOne _id: voiceUserObject.user_id
		if u?
			if voiceUserObject.talking?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.talking':voiceUserObject.talking}})# talking
			if voiceUserObject.joined?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.joined':voiceUserObject.joined}})# joined
			if voiceUserObject.locked?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.locked':voiceUserObject.locked}})# locked
			if voiceUserObject.muted?
				Meteor.Users.update({_id:voiceUserObject.user_id}, {$set: {'user.voiceUser.muted':voiceUserObject.muted}})# muted
		else
			console.log "ERROR! did not find such voiceUser!"
