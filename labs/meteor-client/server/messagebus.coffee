crypto = Meteor.require 'crypto'
postal = Meteor.require 'postal'

moduleDeps = ["RedisPubSub"]

class Meteor.MessageBus

  constructor: ->
    Meteor.config.modules.wait moduleDeps, =>
      @pubSub = Meteor.config.modules.get("RedisPubSub")

  receiveMessages: (callback) ->
    postal.subscribe
      channel: Meteor.config.redis.internalChannels.receive
      topic: "broadcast"
      callback: (msg, envelope) ->
        callback(msg)

  sendAndWaitForReply: (data, callback) ->
    replyTo =
      channel: Meteor.config.redis.internalChannels.reply
      topic: 'get.' + crypto.randomBytes(16).toString('hex')

    postal.subscribe(
      channel: replyTo.channel
      topic: replyTo.topic
      callback: (msg, envelope) ->
        callback(null, msg)
    ).once()

    log.info({ message: data, replyTo: replyTo }, "Sending a message and waiting for reply")

    postal.publish
      channel: Meteor.config.redis.internalChannels.publish
      topic: 'broadcast'
      replyTo: replyTo
      data: data

  sendingToRedis: (channel, message) =>
    @pubSub.publishing(channel, message)
