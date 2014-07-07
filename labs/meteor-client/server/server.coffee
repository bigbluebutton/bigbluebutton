###
Meteor.startup(function () {
  // Add seed data if first time server starting
  CreateSeedData();

  // Publish data collections
  PublishCollections();

  // Set collection permissions
  SetCollectionPermissions();

});
###

Meteor.startup ->
  console.log "server start"

  #remove all data
  Meteor.Users.remove({})
  console.log "cleared Users Collection!"
  Meteor.Chat.remove({})
  console.log "cleared Chat Collection!"
  Meteor.Meetings.remove({})
  console.log "cleared Meetings Collection!"
  Meteor.Shapes.remove({})
  console.log "cleared Shapes Collection!"


  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    console.log "created pubsub")
