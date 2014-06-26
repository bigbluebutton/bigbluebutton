Meteor.methods
  runRedisAndValidate: (meetingId, userId, authToken) ->
    redisPubSub = new Meteor.RedisPubSub
    redisPubSub.sendValidateToken(meetingId, userId, authToken)

  userLogout: (meetingId, userId) ->
    #remove from the collection
    Meteor.call("removeFromCollection", meetingId, userId)

    #dispatch a message to redis
    redisPubSub = new Meteor.RedisPubSub # we should not need to create a new pubsub
    redisPubSub.sendUserLeavingRequest(meetingId, userId)


class Meteor.RedisPubSub
  constructor: (callback) ->
    console.log "constructor RedisPubSub"

    @pubClient = redis.createClient()
    @subClient = redis.createClient()
        
    console.log("RPC: Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")

    #log.info      
    @subClient.on "psubscribe", Meteor.bindEnvironment(@_onSubscribe)
    @subClient.on "pmessage", Meteor.bindEnvironment(@_onMessage)

    @subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)
    callback @

  # Construct and send a message to bbb-web to validate the user
  sendValidateToken: (meetingId, userId, authToken) ->
    console.log "\n\n i am sending a validate_auth_token with " + userId + "" + meetingId

    message = {
      "payload": {
        "auth_token": authToken
        "userid": userId
        "meeting_id": meetingId
      },
      "header": {
        "timestamp": new Date().getTime()
        "reply_to": meetingId + "/" + userId
        "name": "validate_auth_token"
      }
    }
    if authToken? and userId? and meetingId?
      @pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify(message))
    else
      console.log "did not have enough information to send a validate_auth_token message"

  sendUserLeavingRequest: (meetingId, userId) ->
    console.log "\n\n sending a user_leaving_request for #{meetingId}:#{userId}"
    message = {
      "payload": {
        "meeting_id": meetingId
        "userid": userId
      },
      "header": {
        "timestamp": new Date().getTime()
        "name": "user_leaving_request"
        "version": "0.0.1"
      }
    }
    if userId? and meetingId?
      @pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify(message))
    else
      console.log "did not have enough information to send a user_leaving_request"

  _onSubscribe: (channel, count) =>
    console.log "Subscribed to #{channel}"

    #grab data about all active meetings on the server
    message = {
      "header": {
        "name": "get_all_meetings_request"
      }
      "payload": {
      }
    }
    @pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify (message))

  _onMessage: (pattern, channel, jsonMsg) =>
    # TODO: this has to be in a try/catch block, otherwise the server will
    # crash if the message has a bad format

    message = JSON.parse(jsonMsg)
    correlationId = message.payload?.reply_to or message.header?.reply_to

    unless message.header?.name is "keep_alive_reply"
      #console.log "\nchannel=" + channel
      #console.log "correlationId=" + correlationId if correlationId?
      console.log "eventType=" + message.header?.name #+ "\n"
      #log.debug({ pattern: pattern, channel: channel, message: message}, "Received a message from redis")
      #console.log jsonMsg


    console.log "Meteor received:\n #{jsonMsg}"

    # if message.header?.name is "user_joined_message"
    #   meetingId = message.payload.meeting_id
    #   user = message.payload.user
    #   Meteor.call("addToCollection", meetingId, user)

    # if message.header?.name is "user_left_message"
    #   userId = message.payload?.user?.userid
    #   meetingId = message.payload?.meeting_id
    #   if userId? and meetingId?
    #     Meteor.call("removeFromCollection", meetingId, userId)
 
    # if message.header?.name is "get_users_reply"
    #   meetingId = message.payload?.meeting_id
    #   users = message.payload?.users
    #   for user in users
    #     Meteor.call("addToCollection", meetingId, user)

  publish: (channel, message) ->
    console.log "Publishing channel=#{channel}, message=#{JSON.stringify(message)}"
    @pubClient.publish(channel, JSON.stringify(message), (err, res) ->
      console.log "err=" + err
      console.log "res=" + res
    )

