# Here we want to extract the meeting_id, user_id, auth_token, etc
# from the uri


Meteor.Router.add {
  '*': (url)->
    urlParts = url.split("&");

    meetingId = urlParts[0].split("=")[1];
    console.log "meetingId=" + meetingId

    userId = urlParts[1].split("=")[1];
    console.log "userId=" + userId

    authToken = urlParts[2].split("=")[1];
    console.log "authToken=" + authToken

    userName = urlParts[3].split("=")[1];
    console.log "userName=" + userName

    ###a = new Meteor.RedisPubSub()
    a.sendValidateAuthToken(meetingId, userId, authToken)
    console.log " called the function"###

    console.log "initializing"
    pubClient = redis.createClient()
    subClient = redis.createClient()

    subClient.on "psubscribe", (channel, count) =>
      #log.info
      console.log("Subscribed to #{channel}")

    subClient.on "pmessage", (pattern, channel, jsonMsg) =>
      console.log "GOT MESSAGE:" + jsonMsg

    #log.info
    console.log("RPC: Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")
    subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)



    console.log "\n\n\n\n i am sending a validate_auth_token with " + userId + "" + meetingId
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
      console.log "yes"
      pubClient.publish(Meteor.config.redis.channels.toBBBApps.meeting, JSON.stringify(message))
}
