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
  # If we can change this to a format where we know what to send the user that'd
  # be much, much better than the user passing in the first part of their
  # credentials and us looking up and suplying them with the second part.
  # It'd be much more secure.
  getMyInfo: (uId) -> #TODO add meetingId
    u = Meteor.Users.findOne("userId": uId)
    if u?
      console.log "__server::getMyInfo " + u.userId + " DBID:" +  u._id + "  name:" + u.user.name
      return  {userId: u.userId, DBID: u._id, name: u.user.name, userSecret: u.userSecret}
    else
      console.log "__server::getMyInfo - could not find user with uId=#{uId}"
      return {error: "did not find that user"}
  
Meteor.startup ->
  Meteor.log.info "server start"

  #remove all data
  clearCollections()

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    Meteor.log.info "created pubsub")
