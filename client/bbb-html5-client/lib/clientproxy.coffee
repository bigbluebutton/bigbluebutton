socketio = require('socket.io')

config = require '../config'
log = require './bbblogger'

MESSAGE = "message"

moduleDeps = ["Controller"]

module.exports = class ClientProxy

  constructor: ->
    config.modules.wait moduleDeps, =>
      @controller = config.modules.get("Controller")

  # Listens for events on the websocket and does something when they are triggered.
  listen: (app) ->
    @io = socketio.listen(app)
    @io.set('log level', 1)
    @io.sockets.on 'connection', (socket) =>
      log.debug({ client: socket }, "Client has connected.")
      socket.on 'message', (jsonMsg) =>
        log.debug("Received message #{jsonMsg}")
        @_handleMessage(socket, jsonMsg)
      socket.on 'disconnect', =>
        @_handleClientDisconnected socket

  # Sends a message in `data` to all the clients that should receive it.
  sendToClients: (data, callback) ->
    # the channel can be the user_id (send to one user only) or the meeting_id
    # (send to everyone in the meeting)
    channel = data?.payload?.user_id or data?.payload?.meeting_id
    channelViewers = @io.sockets.in(channel)

    # if the data has "header":{"name":"some_event_name"} use that name
    # otherwise look for "name":"some_event_name" in the top level of the data
    eventName = data?.header?.name or data?.name

    log.debug({ channel: channel, eventName: eventName, message: data },
      "Sending message to websocket clients")
    channelViewers.emit.apply(channelViewers, [eventName, data])
    callback?()

  _handleClientDisconnected: (socket) ->
    if socket.userId?
      log.info("User [#{socket.userId}] has disconnected.")

  _handleMessage: (socket, message) ->
    if message.header?.name?
      @_handleValidMessage(socket, message)
    else
      log.error({ message: message }, "Invalid message.")

  _handleValidMessage: (socket, message) ->
    switch message.header.name
      when 'authenticateMessage'
        @_handleLoginMessage socket, message
      else
        log.error({ message: message }, 'Unknown message name.')

  _handleLoginMessage: (socket, data) ->
    @controller.processLoginMessage data, (err, result) ->
      if err?
        message = { name: "authenticationReply", error: err }
        sendMessageToClient socket, message
        # Disconnect this socket as it failed authentication.
        socket.disconnect()
      else
        # Assign the userId to this socket. This way we can
        # locate this socket using the userId.
        socket.userId = result.userId
        message = { name: "authenticationReply", data: result }
        sendMessageToClient socket, message

sendMessageToClient = (socket, message) ->
  socket.emit(MESSAGE, JSON.stringify(message))
