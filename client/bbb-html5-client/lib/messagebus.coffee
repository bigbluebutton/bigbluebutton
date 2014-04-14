postal = require('postal')
redisrpc = require './redispubsub'
crypto = require 'crypto'

exports.receiveMessage = (callback) ->
  postal.subscribe({
    channel: "receiveChannel"
    topic: "broadcast",
    callback: (msg, envelope) ->
      callback( msg )
    })


exports.sendMessage = (data, callback) ->
  replyTo = {
    channel: 'model.data',
    topic: 'get.' + crypto.randomBytes(16).toString('hex')
  };

  postal.subscribe({
    channel: replyTo.channel,
    topic: replyTo.topic,
    callback: (msg, envelope) ->
      callback( msg.err, msg.data )
  }).once()

  postal.publish({
    channel: 'publishChannel',
    topic: 'broadcast',
    replyTo: replyTo,
    data: data
  })