class Meteor.RedisPubSub
  constructor: () ->
    console.log "constructor RedisPubSub"

    @pubClient = redis.createClient()
    @subClient = redis.createClient()

    @subClient.on "psubscribe", (channel, count) =>
      #log.info
      console.log("Subscribed to #{channel}")

    @subClient.on "pmessage", (pattern, channel, jsonMsg) =>
      console.log "GOT MESSAGE:" + jsonMsg

    #log.info
    console.log("RPC: Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")
    @subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)

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
