Meteor.startup ->
  Meteor.log.info "server start"

  #remove all data
  clearUsersCollection()
  clearChatCollection()
  clearMeetingsCollection()
  clearShapesCollection()
  clearSlidesCollection()
  clearPresentationsCollection()

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    Meteor.log.info "created pubsub")
