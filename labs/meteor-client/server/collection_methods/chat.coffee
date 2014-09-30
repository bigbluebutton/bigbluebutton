Meteor.methods
	sendChatMessagetoServer: (meetingId, chatObject, requester_id, requesterUserId) ->
		requester = Meteor.Users.findOne({_id: requester_id, userId: requesterUserId})
		
		if requester? and requester.userId is chatObject.from_userid
			# check if this is a private or a public chat message
			eventName = ->
				if chatObject.chat_type is "PRIVATE_CHAT"
					"send_private_chat_message_request"
				else "send_public_chat_message_request"

			# translate the userId to the user's _id
			u = Meteor.Users.findOne({'userId':chatObject.from_userid})
			if u?
				chatObject.from_userid = u._id 
				# console.log "This is the message we're sending"
				# console.log JSON.stringify chatObject
				message =
					header :
						"timestamp": new Date().getTime()
						"name": eventName()
					payload:
						"message" : chatObject
						"meeting_id": meetingId
						"requester_id": chatObject.from_userid
				#
				publish Meteor.config.redis.channels.toBBBApps.chat, message

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@deletePrivateChatMessages = (user1Id, user2Id) ->
	console.log "deleting chat conversation"
	Meteor.Chat.remove({ # find all and remove private messages between the 2 users
		'message.chat_type': 'PRIVATE_CHAT',
		$or: [{'message.from_userid': user1Id, 'message.to_userid': user2Id},{'message.from_userid': user2Id, 'message.to_userid': user1Id}]
	})

@addChatToCollection = (meetingId, messageObject) ->
	# manually convert time from 1.408645053653E12 to 1408645053653 if necessary (this is the time_from that the Flash client outputs)
	messageObject.from_time = (messageObject.from_time).toString().split('.').join("").split("E")[0]
	entry =
		meetingId: meetingId
		message:
			chat_type: messageObject.chat_type
			message: messageObject.message
			to_username: messageObject.to_username
			from_tz_offset: messageObject.from_tz_offset
			from_color: messageObject.from_color
			to_userid: messageObject.to_userid
			from_userid: messageObject.from_userid
			from_time: messageObject.from_time
			from_username: messageObject.from_username
			from_lang: messageObject.from_lang

	id = Meteor.Chat.insert(entry)
	console.log "added chat id=[#{id}]:#{messageObject.message}. Chat.size is now #{Meteor.Chat.find({meetingId: meetingId}).count()}"
# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
