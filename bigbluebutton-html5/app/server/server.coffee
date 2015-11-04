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
  clearPollCollection()

  # create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(->
    Meteor.log.info "created pubsub")


  Meteor.myQueue = new PowerQueue({
    # autoStart:true
    # isPaused: true
  })
  Meteor.myQueue.taskHandler = (data, next, failures) ->
    message = JSON.parse(data.jsonMsg)
    eventName = message.header.name
    if failures > 0
      Meteor.log.error "got a failure on taskHandler #{eventName} #{failures}"

    Meteor.redisPubSub._onMessage(data.pattern, data.channel, data.jsonMsg)
    next()
