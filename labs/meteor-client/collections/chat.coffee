Meteor.methods
  addChatToCollection: (meetingId, messageObject) ->
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
    console.log "added chat id=[#{id}]:#{messageObject.message}. Chat.size is now
     #{Meteor.Chat.find({meetingId: meetingId}).count()}"

  sendChatMessagetoServer: (meetingId, messageObject) ->
    Meteor.call "publishChatMessage", meetingId, messageObject

  deletePrivateChatMessages: (user1, user2) ->
    console.log "deleting chat conversation"
    Meteor.Chat.remove({ # find all and remove private messages between the 2 users
        'message.chat_type': 'PRIVATE_CHAT',
        $or: [{'message.from_userid': user1, 'message.to_userid': user2},{'message.from_userid': user2, 'message.to_userid': user1}]
      })
