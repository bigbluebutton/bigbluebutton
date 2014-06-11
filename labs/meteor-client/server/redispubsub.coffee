if Meteor.isServer
  console.log " I am in the server"
  Meteor.startup ->
    console.log "On startup in the server"
    console.log Meteor.config.appName

    pubClient = redis.createClient()
    subClient = redis.createClient()





    subClient.on "psubscribe", _onSubscribe
    subClient.on "pmessage", _onMessage




    console.log("RPC: Subscribing message on channel: #{Meteor.config.redis.channels.fromBBBApps}")
    subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps)




_onMessage = () ->
  console.log "ON MESSAGE"

_onSubscribe = () ->
  console.log "ON SUBSCRIBE"