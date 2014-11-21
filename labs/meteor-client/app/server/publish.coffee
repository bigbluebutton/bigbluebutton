# Publish only the users that are in the particular meetingId
# On the client side we pass the meetingId parameter
Meteor.publish 'users', (meetingId, userid, authToken) ->
  console.log "attempt publishing users for #{meetingId}, #{userid}, #{authToken}"
  u = Meteor.Users.findOne({'userId': userid, 'meetingId': meetingId})
  if u?
    console.log "found it from the first time #{userid}"
    if isAllowedTo('subscribeUsers', meetingId, userid, authToken)
      console.log "allowed to subscribe to 'users'"
      username = u?.user?.name or "UNKNOWN"

      # offline -> online
      if u.user?.connection_status isnt 'online'
        Meteor.call "validateAuthToken", meetingId, userid, authToken

      Meteor.Users.update({'meetingId':meetingId, 'userId': userid}, {$set:{'user.connection_status': "online"}})
      console.log "username of the subscriber: " + username + ", connection_status becomes online"

      @_session.socket.on("close", Meteor.bindEnvironment(=>
        console.log "\na user lost connection: session.id=#{@_session.id} userId = #{userid}, username=#{username}, meeting=#{meetingId}"
        Meteor.Users.update({'meetingId':meetingId, 'userId': userid}, {$set:{'user.connection_status': "offline"}})
        console.log "username of the user losing connection: " + username + ", connection_status: becomes offline"
        requestUserLeaving meetingId, userid
        # check the status of the user later to see if the user managed to reconnect
        # setTimeout(Meteor.bindEnvironment(=>
        #   result = Meteor.Users.findOne({'userId': userid, 'meetingId': meetingId})?.user?.connection_status
        #   if result is "online"
        #     console.log "user #{userid} (#{username}) managed to reconnect in meeting #{meetingId}"
        #   else
        #     console.log "user #{userid} (#{username}) failed to reconnect in meeting #{meetingId} and will be kicked out of the meeting"
        #     requestUserLeaving meetingId, userid
        #   )
        # , 10000) #TODO pick this from config.coffee
        )
      )

      #publish the users which are not offline
      Meteor.Users.find(
        {meetingId: meetingId, 'user.connection_status':{$ne: "offline"}},
        {fields:{'authToken': false}
        })
    else
      console.log "was not authorized to subscribe to 'users'"

  else #subscribing before the user was added to the collection
    Meteor.call "validateAuthToken", meetingId, userid, authToken
    console.log "there was no such user #{userid}  in #{meetingId}"
    Meteor.Users.find(
      {meetingId: meetingId, 'user.connection_status':{$ne: "offline"}},
      {fields:{'authToken': false}
      })

    # TODO switch the logging here with .info log

    # Meteor.Users.find(
    #   {meetingId: meetingId},
    #   {fields:{'authToken': false}
    #   })


Meteor.publish 'chat', (meetingId, userid, authToken) ->
  if isAllowedTo('subscribeChat', meetingId, userid, authToken)
    console.log "publishing chat for #{meetingId} #{userid} #{authToken}"
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
      console.log "could not find myself in publishing chat"

Meteor.publish 'shapes', (meetingId) ->
  Meteor.Shapes.find({meetingId: meetingId})

Meteor.publish 'slides', (meetingId) ->
  console.log "publishing slides for #{meetingId}"
  Meteor.Slides.find({meetingId: meetingId})

Meteor.publish 'meetings', (meetingId) ->
  console.log "publishing meetings for #{meetingId}"
  Meteor.Meetings.find({meetingId: meetingId})

Meteor.publish 'presentations', (meetingId) ->
  console.log "publishing presentations for #{meetingId}"
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
