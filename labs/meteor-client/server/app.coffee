if Meteor.isServer
  console.log " I am in the server"
  Meteor.startup ->
    console.log "On startup in the server"
    console.log Meteor.config.appName



    a = new Meteor.ClientProxy()

    b = new Meteor.RedisPubSub()
