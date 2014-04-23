socketio = require('socket.io')

config = require '../config'
log = require './bbblogger'

MESSAGE = "message"

moduleDeps = ["Controller"]

module.exports = class ClientProxy

  constructor: ->
    config.modules.wait moduleDeps, =>
      @controller = config.modules.get("Controller")

  listen: (app) ->
    io = socketio.listen(app)
    io.set('log level', 1)
    io.sockets.on 'connection', (socket) =>
      log.debug({client: socket}, "Client has connected.")
      socket.on 'message', (jsonMsg) =>
        log.debug("Received message #{jsonMsg}")
        @_handleMessage(socket, jsonMsg)
      socket.on 'disconnect', =>
        @_handleClientDisconnected socket

  _handleClientDisconnected: (socket) ->
    if socket.userId?
      log.info("User [#{socket.userId}] has disconnected.")

  _handleMessage: (socket, message) ->
    if message.header?.name?
      @_handleValidMessage(socket, message)
    else
      log.error({message: message}, "Invalid message.")

  _handleValidMessage: (socket, message) ->
    switch message.header.name
      when 'authenticateMessage'
        @_handleLoginMessage socket, message
      else
        log.error({message: message}, 'Unknown message name.')

  _handleLoginMessage: (socket, data) ->
    @controller.processLoginMessage data, (err, result) ->
      if err?
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

sendMessageToClient = (socket, message) ->
  socket.emit(MESSAGE, JSON.stringify(message))
