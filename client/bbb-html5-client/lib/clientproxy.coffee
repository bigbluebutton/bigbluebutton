{Controller} = require './controller'
log = require './bbblogger'

MESSAGE = "message"

class SocketIoMessageHandler
  constructor: (io) ->
    @io = io 
    @controller = new Controller(@)
    @initialize()

  initialize: () ->  
    @io.sockets.on('connection', (socket) ->
      console.log("Client has connected.")
      log.debug("LOG: Client has connected.")
      socket.on('message', (jsonMsg) ->
        log.debug("Received message #{jsonMsg}")
        handleMessage(socket, @controller, jsonMsg)
      )
      socket.on('disconnect', () -> 
        handleClientDisconnected socket
      )
    )

exports.SocketIoMessageHandler = SocketIoMessageHandler

handleClientDisconnected = (socket) ->
  log.debug("LOG: Client has disconnected.")

handleMessage = (socket, controller, message) ->
  if message.name?
    handleValidMessage(socket, controller, message)
  else
    log.error({error: "Invalid message", message: JSON.stringify(message)})

handleValidMessage = (socket, controller, message) ->
  switch message.name
    when 'authenticateMessage'
      handleLoginMessage socket, controller, message
    when 'Sandra'
      connectJackNumber 22
    when 'Toby'
      connectJackNumber 9
    else
      console.log('I am sorry, your call cannot be connected')

handleLoginMessage = (socket, controller, data) ->
  controller.processLoginMessage(data, (err, result) ->
    if (err)
      message = {name: "authenticationReply", error: err}
      sendMessageToClient message
    else
      message = {name: "authenticationReply", data: result}
      sendMessageToClient message
   )

sendMessageToClient = (socket, message) ->
  socket.emit(MESSAGE, JSON.stringify(message))





