socketio = require('socket.io')

controller = require './controller'
log = require './bbblogger'

MESSAGE = "message"

io = null

exports.listen = (app) ->  
  io = socketio.listen(app)
  io.sockets.on('connection', (socket) ->
    console.log("Client has connected.")
    log.debug("LOG: Client has connected.")
    socket.on('message', (jsonMsg) ->
      log.debug("Received message #{jsonMsg}")
      handleMessage(socket, jsonMsg)
    )
    socket.on('disconnect', () -> 
      handleClientDisconnected socket
    )
  )

handleClientDisconnected = (socket) ->
  log.debug("LOG: Client has disconnected.")

handleMessage = (socket, message) ->
  if message.name?
    handleValidMessage(socket, message)
  else
    log.error({error: "Invalid message", message: JSON.stringify(message)})

handleValidMessage = (socket, message) ->
  switch message.name
    when 'authenticateMessage'
      handleLoginMessage socket, message
    when 'Sandra'
      connectJackNumber 22
    when 'Toby'
      connectJackNumber 9
    else
      console.log('I am sorry, your call cannot be connected')

handleLoginMessage = (socket, data) ->
  controller.processLoginMessage(data, (err, result) ->
    if (err)
      message = {name: "authenticationReply", error: err}
      sendMessageToClient socket, message
    else
      message = {name: "authenticationReply", data: result}
      sendMessageToClient socket, message
  )

sendMessageToClient = (socket, message) ->
  socket.emit(MESSAGE, JSON.stringify(message))











