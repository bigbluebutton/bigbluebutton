socketio = require('socket.io')

controller = require './controller'
log = require './bbblogger'

MESSAGE = "message"

io = null

exports.listen = (app) ->  
  io = socketio.listen(app)
  io.sockets.on('connection', (socket) ->
    console.log("Client has connected.")
    socket.on('message', (jsonMsg) ->
      log.debug("Received message #{jsonMsg}")
      handleMessage(socket, jsonMsg)
    )
    socket.on('disconnect', () -> 
      handleClientDisconnected socket
    )
  )

handleClientDisconnected = (socket) ->
  if (socket.userId?)
    log.info("User [#{socket.userId}] has disconnected.")

handleMessage = (socket, message) ->
  if message.header.name?
    handleValidMessage(socket, message)
  else
    log.error({message: message}, "Invalid message.")

handleValidMessage = (socket, message) ->
  switch message.header.name
    when 'authenticateMessage'
      handleLoginMessage socket, message
    else
      log.error({message: message}, 'Unknown message name.')

handleLoginMessage = (socket, data) ->
  controller.processLoginMessage(data, (err, result) ->
    if (err)
      message = {name: "authenticationReply", error: err}
      sendMessageToClient socket, message
      # Disconnect this socket as it failed authentication.
      socket.disconnect()
    else
      # Assign the userId to this socket. This way we can
      # locate this socket using the userId.
      socket.userId = result.userId
      message = {name: "authenticationReply", data: result}
      sendMessageToClient socket, message
  )

sendMessageToClient = (socket, message) ->
  socket.emit(MESSAGE, JSON.stringify(message))













