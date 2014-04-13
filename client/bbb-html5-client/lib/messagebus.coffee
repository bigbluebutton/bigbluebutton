postal = require('postal')
redisrpc = require './redispubsub'
crypto = require 'crypto'

io = require('socket.io').listen(3009)

io.sockets.on('connection', (socket) ->
  console.log("Connected")
  socket.on('login', (data) ->
   console.log("User login #{data}")
   sendMessage(data, (err, result) ->
     if (err)
      console.log("ERROR: #{err}")
     else
      console.log("SUCCESS: #{result}")
      socket.emit('authenticated', JSON.stringify(result))
   )
  )

  socket.on('event', (data) -> 
    console.log("Server received event.")
  )

  socket.on('disconnect', () -> 
    console.log("Server disconnect event.")
  )

  socket.emit('ready')
)


sendMessage = (data, callback) ->
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