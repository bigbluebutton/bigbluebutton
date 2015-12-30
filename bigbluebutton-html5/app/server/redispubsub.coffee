Meteor.methods
  # Construct and send a message to bbb-web to validate the user
  validateAuthToken: (meetingId, userId, authToken) ->
    Meteor.log.info "sending a validate_auth_token with",
      userid: userId
      authToken: authToken
      meetingid: meetingId

    message =
      "payload":
        "auth_token": authToken
        "userid": userId
        "meeting_id": meetingId
      "header":
        "timestamp": new Date().getTime()
        "reply_to": meetingId + "/" + userId
        "name": "validate_auth_token"

    if authToken? and userId? and meetingId?
      createDummyUser meetingId, userId, authToken
      publish Meteor.config.redis.channels.toBBBApps.meeting, message
    else
      Meteor.log.info "did not have enough information to send a validate_auth_token message"


class Meteor.RedisPubSub
  constructor: (callback) ->
    Meteor.log.info "constructor RedisPubSub"

    @pubClient = redis.createClient()
    @subClient = redis.createClient()

    Meteor.log.info("Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")

    @subClient.on "psubscribe", Meteor.bindEnvironment(@_onSubscribe)
    @subClient.on "pmessage", Meteor.bindEnvironment(@_addToQueue)

    @subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)

    callback @

  _onSubscribe: (channel, count) =>
    Meteor.log.info "Subscribed to #{channel}"

    #grab data about all active meetings on the server
    message =
      "header":
        "name": "get_all_meetings_request"
      "payload": {} # I need this, otherwise bbb-apps won't recognize the message
    publish Meteor.config.redis.channels.toBBBApps.meeting, message


  _addToQueue: (pattern, channel, jsonMsg) =>
    message = JSON.parse(jsonMsg)
    eventName = message.header.name

    messagesWeIgnore = [
      "BbbPubSubPongMessage"
      "bbb_apps_is_alive_message"
      "broadcast_layout_message"
    ]

    unless eventName in messagesWeIgnore
      console.log "Q #{eventName} #{Meteor.myQueue.total()}"
      Meteor.myQueue.add({
        pattern: pattern
        channel: channel
        jsonMsg: jsonMsg
      })

# --------------------------------------------------------------------------------------------
# Private methods on server
# --------------------------------------------------------------------------------------------

# message should be an object
@publish = (channel, message) ->
  Meteor.log.info "redis outgoing message  #{message.header.name}",
    channel: channel
    message: message

  if Meteor.redisPubSub?
    Meteor.redisPubSub.pubClient.publish channel, JSON.stringify(message), (err, res) ->
      if err
        Meteor.log.info "error",
          error: err

  else
    Meteor.log.info "ERROR!! Meteor.redisPubSub was undefined"
