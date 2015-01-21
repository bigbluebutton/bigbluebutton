Meteor.methods
	# meetingId: the id of the meeting
	# chatObject: the object including info on the chat message, including the text
	# requesterUserId: the userId of the user sending chat
	# requesterToken: the authToken of the requester
	sendChatMessagetoServer: (meetingId, chatObject, requesterUserId, requesterToken) ->
		chatType = chatObject.chat_type
		recipient = chatObject.to_userid
		eventName = null
		action = ->
			if chatType is "PUBLIC_CHAT"
				eventName = "send_public_chat_message_request"
				return 'chatPublic'
			else
				eventName = "send_private_chat_message_request"
				if recipient is requesterUserId
					return 'chatSelf' #not allowed
				else
					return 'chatPrivate'

		if isAllowedTo(action(), meetingId, requesterUserId, requesterToken) and chatObject.from_userid is requesterUserId
			message =
				header :
					timestamp: new Date().getTime()
					name: eventName
				payload: 
					message: chatObject
					meeting_id: meetingId
					requester_id: chatObject.from_userid

			Meteor.log.info "publishing chat to redis"
			publish Meteor.config.redis.channels.toBBBApps.chat, message
		return

	deletePrivateChatMessages: (userId, contact_id) ->
		# if authorized pass through
		requester = Meteor.Users.findOne({userId: userId})
		contact = Meteor.Users.findOne({_id: contact_id})
		deletePrivateChatMessages(requester.userId, contact.userId)
# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addChatToCollection = (meetingId, messageObject) ->
	# manually convert time from 1.408645053653E12 to 1408645053653 if necessary
	# (this is the time_from that the Flash client outputs)
	messageObject.from_time = (messageObject.from_time).toString().split('.').join("").split("E")[0]

	if messageObject.from_userid? and messageObject.to_userid?
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
		Meteor.log.info "added chat id=[#{id}]:#{messageObject.message}." #" Chat.size is now #{Meteor.Chat.find({meetingId: meetingId}).count()}"


# called on server start and meeting end
@clearChatCollection = (meetingId) ->
	if meetingId?
		Meteor.Chat.remove({meetingId: meetingId}, Meteor.log.info "cleared Chat Collection (meetingId: #{meetingId}!")
	else
		Meteor.Chat.remove({}, Meteor.log.info "cleared Chat Collection (all meetings)!")

# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
