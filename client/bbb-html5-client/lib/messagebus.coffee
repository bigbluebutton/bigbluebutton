postal = require('postal')
crypto = require 'crypto'

config = require '../config'

moduleDeps = ["RedisPubSub"]

module.exports = class MessageBus

  constructor: ->
    config.modules.wait moduleDeps, =>
      @pubSub = config.modules.get("RedisPubSub")

  receiveMessages: (callback) ->
    postal.subscribe
      channel: config.redis.internalChannels.receive
      topic: "broadcast"
      callback: (msg, envelope) ->
        callback(msg.err, msg.data)

  sendAndWaitForReply: (data, callback) ->
    replyTo =
      channel: config.redis.internalChannels.reply
      topic: 'get.' + crypto.randomBytes(16).toString('hex')

    postal.subscribe(
      channel: replyTo.channel
      topic: replyTo.topic
      callback: (msg, envelope) ->
        callback(msg.err, msg.data)
    ).once()

    postal.publish
      channel: config.redis.internalChannels.publish
      topic: 'broadcast'
      replyTo: replyTo
      data: data
