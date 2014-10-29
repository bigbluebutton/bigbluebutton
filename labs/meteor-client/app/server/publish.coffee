# Publish only the users that are in the particular meetingId
# On the client side we pass the meetingId parameter
Meteor.publish 'users', (meetingId, userid) ->
  console.log "publishing users for #{meetingId}, #{userid}"

  if Meteor.Users.findOne({'meetingId': meetingId, 'userId': userid})?
    console.log "found it from the first time #{userid}"

    u = Meteor.Users.findOne({'userId': userid, 'meetingId': meetingId})
    console.log "u =" + JSON.stringify u
    username = u?.user?.name or "UNKNOWN"
    Meteor.Users.update({'meetingId':meetingId, 'userId': userid}, {$set:{'user.connection_status': "online"}})
    console.log "username of the subscriber: " + username + ", connection_status becomes online"

    @_session.socket.on("close", Meteor.bindEnvironment(=>
      console.log "\na user lost connection: session.id=#{@_session.id}
       userId = #{userid}, username=#{username}, meeting=#{meetingId}"
      Meteor.Users.update({'meetingId':meetingId, 'userId': userid}, {$set:{'user.connection_status': "offline"}})
      console.log "username of the user losing connection: " + username + ", connection_status: becomes offline"

      setTimeout(Meteor.bindEnvironment(=>
        console.log "will check if a user with bbb userid #{userid} is online(managed to reconnect)"
        result = Meteor.Users.findOne({'userId': userid, 'meetingId': meetingId})?.user?.connection_status
        console.log "the result here is #{result}"
        if result is "online"
          console.log "user #{userid} (#{username}) managed to reconnect in meeting #{meetingId}"
        else
          console.log "user #{userid} (#{username}) failed to reconnect in meeting #{meetingId} and will be kicked out of the meeting"
          #requestUserLeaving(meetingId,  userid, u?._id)
          Meteor.call "userLogout", meetingId, userid
        )
      , 10000) #TODO pick this from config.coffee
      )
    )

    Meteor.Users.find(
      {meetingId: meetingId},
      {fields:{
        'userId': 0,
        'user.userid': 0,
        'user.extern_userid': 0,
        'user.voiceUser.userid': 0,
        'user.voiceUser.web_userid': 0}
      })

  else #subscribing before the user was added to the collection
    Meteor.call "validateAuthToken", meetingId, userid, userid
    console.log "there was no such user #{userid}  in #{meetingId}"


    # TODO
    # here we need to wait for the user to be added to the Users collection
    # then we can return the cursor

    Meteor.Users.find({meetingId: meetingId}).observeChanges({
      added: (id, user) ->
        if user?.user?.userid is userid
          console.log "finally user with id:#{userid} joined"
          return Meteor.Users.find({meetingId: meetingId}, {fields: { 'userId': 0, 'user.userid': 0, 'user.extern_userid': 0, 'user.voiceUser.userid': 0, 'user.voiceUser.web_userid': 0 }})
        else
          console.log "i was not looking for #{user.user.userid}"
    })




Meteor.publish 'chat', (meetingId, userid) ->
  me = Meteor.Users.findOne({meetingId: meetingId, userId: userid})
  if me?
    me = me._id
    Meteor.Chat.find({$or: [
      {'message.chat_type': 'PUBLIC_CHAT', 'meetingId': meetingId},
      {'message.from_userid': me, 'meetingId': meetingId},
      {'message.to_userid': me, 'meetingId': meetingId}
      ]})

Meteor.publish 'shapes', (meetingId) ->
  Meteor.Shapes.find({meetingId: meetingId})

Meteor.publish 'slides', (meetingId) ->
  Meteor.Slides.find({meetingId: meetingId})

Meteor.publish 'meetings', (meetingId) ->
  Meteor.Meetings.find({meetingId: meetingId})

Meteor.publish 'presentations', (meetingId) ->
  Meteor.Presentations.find({meetingId: meetingId})

# Clear all data in subcriptions
@clearCollections = ->
    Meteor.Users.remove({})
    console.log "cleared Users Collection!"
    Meteor.Chat.remove({})
    console.log "cleared Chat Collection!"
    Meteor.Meetings.remove({})
    console.log "cleared Meetings Collection!"
    Meteor.Shapes.remove({})
    console.log "cleared Shapes Collection!"
    Meteor.Slides.remove({})
    console.log "cleared Slides Collection!"
    Meteor.Presentations.remove({})
    console.log "cleared Presentations Collection!"
