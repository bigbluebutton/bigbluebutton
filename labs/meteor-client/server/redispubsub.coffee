if Meteor.isServer
  console.log " I am in the server"
  Meteor.startup ->
    console.log "On startup in the server"
    client = redis.createClient();
    console.log client?
    console.log Meteor.config.appName