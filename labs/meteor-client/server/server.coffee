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
Meteor.methods
  getMyInfo: (uId) ->
    u = Meteor.Users.findOne("userId": uId)
    if u?
      {
        userId: u.userId
        DBID: u._id
        name: u.user.name
      }

Meteor.startup ->
  console.log "server start"
  
  #remove all data
  clearCollections()

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    console.log "created pubsub")
