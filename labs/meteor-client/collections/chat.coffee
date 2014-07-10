Meteor.methods
  addChatToCollection: (meetingId, messageObject) ->
    entry = {
      meetingId: meetingId
      message: { # or message: messageObject but this is more verbose
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
      }
    }
    id = Meteor.Chat.insert(entry)
    console.log "added chat id=[#{id}]:#{messageObject.message}. Chat.size is now
     #{Meteor.Chat.find({meetingId: meetingId}).count()}"

  sendChatMessagetoServer: (meetingId, messageObject) ->
    Meteor.call "publishChatMessage", meetingId, messageObject

  invalidateAllTabs: (userId, setFirst=false) -> # make all tabs false
    Meteor.ChatTabs.update({'belongsTo':userId}, { $set: { isActive:false} }, {multi:true})

    if setFirst # able to specify the first to be active
      console.log "setting first tab as active"
      firstRecord = Meteor.ChatTabs.findOne({'belongsTo':userId, name:"Public"})
      Meteor.ChatTabs.update({_id: firstRecord._id}, {$set: isActive:true})
