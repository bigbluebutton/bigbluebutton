Meteor.methods
	sendChatMessagetoServer: (meetingId, chatObject, requesterUserId) ->
		# inside the chatObject, they store their _id as the sender
		# and they pass their userId to this method as a param
		transformedChatObject = chatObject

		Meteor.log.info "requesterUserId: #{requesterUserId} | from_userid: #{transformedChatObject.from_userid}"
		requester = Meteor.Users.findOne({_id: transformedChatObject.from_userid, userId: requesterUserId})
		forPublic = transformedChatObject.to_userid is 'public_chat_userid'

		if requester? # User exists, and is valid
			Meteor.log.info "requester exists"
			# check if this is a private or a public chat message
			eventName = ->
				if transformedChatObject.chat_type is "PRIVATE_CHAT"
					"send_private_chat_message_request"
				else "send_public_chat_message_request"

			recipient = Meteor.Users.findOne(_id: transformedChatObject.to_userid)
			if recipient? or forPublic

				# translate _ids to userIds for flash
				transformedChatObject.from_userid = requester.userId
				transformedChatObject.to_userid = if forPublic then 'public_chat_userid' else recipient.userId

				message =
					header :
						"timestamp": new Date().getTime()
						"name": eventName()
					payload: 
						"message" : transformedChatObject
						"meeting_id": meetingId
						"requester_id": transformedChatObject.from_userid
				#
				Meteor.log.info transformedChatObject
				publish Meteor.config.redis.channels.toBBBApps.chat, message
		else
			Meteor.log.info "requester no exists"

	deletePrivateChatMessages: (userId, contact_id) ->
		# if authorized pass through
		requester = Meteor.Users.findOne({userId: userId})
		contact = Meteor.Users.findOne({_id: contact_id})
		deletePrivateChatMessages(requester.userId, contact.userId)
# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------
@addChatToCollection = (meetingId, messageObject) ->
	transformedChatObject = messageObject

	# manually convert time from 1.408645053653E12 to 1408645053653 if necessary (this is the time_from that the Flash client outputs)
	transformedChatObject.from_time = (transformedChatObject.from_time).toString().split('.').join("").split("E")[0]
	
	fromUser = Meteor.Users.findOne({userId: transformedChatObject.from_userid})
	toUser = Meteor.Users.findOne({userId: transformedChatObject.to_userid})
	forPublic = transformedChatObject.to_userid is 'public_chat_userid'

	if (fromUser? and toUser?) or forPublic
		# translate ids from flash to html5
		transformedChatObject.from_userid = fromUser?._id
		transformedChatObject.to_userid = if forPublic then 'public_chat_userid' else toUser?._id

		if transformedChatObject.from_userid? and transformedChatObject.to_userid?
			entry =
				meetingId: meetingId
				message:
					chat_type: transformedChatObject.chat_type
					message: transformedChatObject.message
					to_username: transformedChatObject.to_username
					from_tz_offset: transformedChatObject.from_tz_offset
					from_color: transformedChatObject.from_color
					to_userid: transformedChatObject.to_userid
					from_userid: transformedChatObject.from_userid
					from_time: transformedChatObject.from_time
					from_username: transformedChatObject.from_username
					from_lang: transformedChatObject.from_lang

			id = Meteor.Chat.insert(entry)
			#Meteor.log.info "added chat id=[#{id}]:#{transformedChatObject.message}. Chat.size is now #{Meteor.Chat.find({meetingId: meetingId}).count()}"
# --------------------------------------------------------------------------------------------
# end Private methods on server
# --------------------------------------------------------------------------------------------
