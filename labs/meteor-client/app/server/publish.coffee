# Publish only the online users that are in the particular meetingId
# On the client side we pass the meetingId parameter
Meteor.publish 'users', (meetingId, userid, authToken) ->
  Meteor.log.info "attempt publishing users for #{meetingId}, #{userid}, #{authToken}"
  u = Meteor.Users.findOne({'userId': userid, 'meetingId': meetingId})
  if u?
    Meteor.log.info "found it from the first time #{userid}"
    if isAllowedTo('subscribeUsers', meetingId, userid, authToken)
      Meteor.log.info "allowed to subscribe to 'users'"
      username = u?.user?.name or "UNKNOWN"

      # offline -> online
      if u.user?.connection_status isnt 'online'
        Meteor.call "validateAuthToken", meetingId, userid, authToken

      Meteor.Users.update({'meetingId':meetingId, 'userId': userid}, {$set:{'user.connection_status': "online"}})
      Meteor.log.info "username of the subscriber: " + username + ", connection_status becomes online"

      @_session.socket.on("close", Meteor.bindEnvironment(=>
        Meteor.log.info "\na user lost connection: session.id=#{@_session.id} userId = #{userid}, username=#{username}, meeting=#{meetingId}"
        Meteor.Users.update({'meetingId':meetingId, 'userId': userid}, {$set:{'user.connection_status': "offline"}})
        Meteor.log.info "username of the user losing connection: " + username + ", connection_status: becomes offline"
        requestUserLeaving meetingId, userid
        )
      )

      #publish the users which are not offline
      Meteor.Users.find(
        {meetingId: meetingId, 'user.connection_status':{$ne: "offline"}},
        {fields:{'authToken': false}
        })
    else
      Meteor.log.info "was not authorized to subscribe to 'users'"

  else #subscribing before the user was added to the collection
    Meteor.call "validateAuthToken", meetingId, userid, authToken
    Meteor.log.info "there was no such user #{userid}  in #{meetingId}"
    Meteor.Users.find(
      {meetingId: meetingId, 'user.connection_status':{$ne: "offline"}},
      {fields:{'authToken': false}
      })


Meteor.publish 'chat', (meetingId, userid, authToken) ->
  if isAllowedTo('subscribeChat', meetingId, userid, authToken)
    Meteor.log.info "publishing chat for #{meetingId} #{userid} #{authToken}"
    me = Meteor.Users.findOne({meetingId: meetingId, userId: userid})
    if me?
      me = me._id
      #TODO change _id with userid
      return Meteor.Chat.find({$or: [
        {'message.chat_type': 'PUBLIC_CHAT', 'meetingId': meetingId},
        {'message.from_userid': me, 'meetingId': meetingId},
        {'message.to_userid': me, 'meetingId': meetingId}
        ]})
    else
      Meteor.log.info "could not find myself in publishing chat"

Meteor.publish 'shapes', (meetingId) ->
  Meteor.Shapes.find({meetingId: meetingId})

Meteor.publish 'slides', (meetingId) ->
  Meteor.log.info "publishing slides for #{meetingId}"
  Meteor.Slides.find({meetingId: meetingId})

Meteor.publish 'meetings', (meetingId) ->
  Meteor.log.info "publishing meetings for #{meetingId}"
  Meteor.Meetings.find({meetingId: meetingId})

Meteor.publish 'presentations', (meetingId) ->
  Meteor.log.info "publishing presentations for #{meetingId}"
  Meteor.Presentations.find({meetingId: meetingId})

# Clear all data in subcriptions
@clearCollections = ->
    Meteor.Users.remove({})
    Meteor.log.info "cleared Users Collection!"
    Meteor.Chat.remove({})
    Meteor.log.info "cleared Chat Collection!"
    Meteor.Meetings.remove({})
    Meteor.log.info "cleared Meetings Collection!"
    Meteor.Shapes.remove({})
    Meteor.log.info "cleared Shapes Collection!"
    Meteor.Slides.remove({})
    Meteor.log.info "cleared Slides Collection!"
    Meteor.Presentations.remove({})
    Meteor.log.info "cleared Presentations Collection!"
