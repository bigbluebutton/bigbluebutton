Meteor.startup ->
  Meteor.log.info "server start"

  #remove all data
  Meteor.WhiteboardCleanStatus.remove({})
  clearUsersCollection()
  clearChatCollection()
  clearMeetingsCollection()
  clearShapesCollection()
  clearSlidesCollection()
  clearPresentationsCollection()

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    Meteor.log.info "created pubsub")
