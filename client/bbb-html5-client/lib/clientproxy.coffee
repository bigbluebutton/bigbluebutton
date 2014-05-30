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
      log.debug({ client: socket.id }, "Client has connected.")
      socket.on 'message', (jsonMsg) =>
        log.debug({ message: jsonMsg }, "Received message")
        @_handleMessage(socket, jsonMsg)
      socket.on 'disconnect', =>
        @_handleClientDisconnected socket

  # Sends a message in `data` to all the clients that should receive it.
  sendToClients: (data, callback) ->
    #log.debug({ data: data }, "Sending to client")
    
    # the channel can be the user_id (send to one user only) or the meeting_id
    # (send to everyone in the meeting)
    channel = data?.payload?.user_id or data?.payload?.meeting_id

    # if the data has "header":{"name":"some_event_name"} use that name
    # otherwise look for "name":"some_event_name" in the top level of the data
    eventName = data?.header?.name or data?.name

    # clients = @io.sockets.clients(channel)
    # console.log "Found", clients?.length, "clients for the channel", channel

    #log.debug({ channel: channel, eventName: eventName, message: data, clientCount: clients?.length },
    #  "Sending message to websocket clients")

    # TODO: if `channel` is undefined, it should not send the message,
    #   instead if is sending to all users
    @io.sockets.in(channel).emit(eventName, data)
    callback?()

  _handleClientDisconnected: (socket) ->
    console.log "\ntrying to disconnect"

    #if socket.userId?
    #  log.info("User [#{socket.userId}] has disconnected.")

  _handleMessage: (socket, message) ->
    if message.header?.name?
      @_handleValidMessage(socket, message)
    else
      log.error({ message: message }, "Invalid message.")

  _handleValidMessage: (socket, message) =>
    switch message.header.name
      when 'validate_auth_token'
        @_handleLoginMessage socket, message
      when 'send_public_chat_message'
        @controller.sendingChat message
      when 'user_leaving_request'
        @controller.sendingUsersMessage message
      else
        log.error({ message: message }, 'Unknown message name.')

  _handleLoginMessage: (socket, data) ->
    @controller.processAuthMessage(data, (err, result) ->
      if err?
        log.debug({ message: result }, "Sending authentication not OK to user and disconnecting socket")
        sendMessageToClient(socket, result)
        socket.disconnect()
      else
        log.debug({ userChannel: result.payload.user_id, meetingChannel: result.payload.meeting_id },
          "Subscribing a user to his channels")
        socket.join(result.payload.user_id)
        socket.join(result.payload.meeting_id)

        # assign the userId to this socket. This way we can
        # locate this socket using the userId.
        socket.userId = result?.payload?.user_id

        log.debug({ message: result }, "Sending authentication OK reply to user")
        sendMessageToClient(socket, result)
    )

sendMessageToClient = (socket, message) ->
  socket.emit(MESSAGE, message)
