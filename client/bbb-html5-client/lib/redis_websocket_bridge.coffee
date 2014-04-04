rack = require("hat").rack()
redis = require("redis")
sanitizer = require("sanitizer")

config = require("../config")
Logger = require("./logger")
RedisKeys = require("../lib/redis_keys")
Utils = require("./utils")
messageLib = require("bigbluebutton-messages")

moduleDeps = ["RedisAction", "RedisStore", "RedisPublisher"]

# Bridge between events in Redis and the clients connected via Websocket.
module.exports = class RedisWebsocketBridge

  # Creates a new RedisWebsocketBridge instance
  #
  # @param io [SocketIO instance]
  constructor: (@io) ->
    config.modules.wait moduleDeps, =>
      @redisAction = config.modules.get("RedisAction")
      @redisPublisher = config.modules.get("RedisPublisher")

      @sub = redis.createClient()
      subscriptions = ["*"]
      @sub.psubscribe.apply(@sub, subscriptions)

      # @todo shouldn't need redis store here, shouldn't change redis
      @redisStore = config.modules.get("RedisStore")

      @_redis_registerListeners()
      @_socket_registerListeners()

  # Registers listeners to all socket IO events that can be emitted by the clients.
  # The events will always pass content to the server and the server will usually
  # treat this content and generate new events on redis.
  #
  # @private
  _socket_registerListeners: () ->
    @io.sockets.on "connection", (socket) =>
      socket.on "user connect", () => @_socket_onUserConnected2(socket)
      socket.on "disconnect", () => @_socket_onUserDisconnected(socket)
      socket.on "msg", (msg) => @_socket_onChatMessage2(socket, msg)
      socket.on "logout", () => @_socket_onLogout(socket)
      socket.on "allShapes", () => @_socket_onAllShapes(socket)

  # Listens for messages published to redis
  #
  # @param pattern [string] Matched pattern on Redis PubSub
  # @param channel [string] Channel the message was published on (socket room)
  # @param message [string] Message published (socket message data)
  # @private
  _redis_registerListeners: ->
    @sub.on "pmessage", (pattern, channel, message) =>
      ###
        using the message library instead of simply doing attributes = JSON.parse messages
      ###
      eventType = null
      messageLib.getEventType(message, #identify the name/type of the message
        (text)->
          eventType = text
          console.log "assigned eventType="+eventType
        ,
          (err)->
            console.log err
      )

      if eventType is null
        attributes = JSON.parse message # no change to this part yet as it's related to 
        #...the old style messages
      else
        attributes = null

        messageLib["#{eventType}_to_javascript_object"](message,#convert to Javascript Object
          (object)->
            console.log "successfully converted (to js object) " + object.header.name
            attributes = object
            return
          ,
          (err)->
            console.log "not successful in converting to js object "+ eventType + " " + err
        )
      
      Logger.info "message from redis on channel:#{channel}, data:#{message}"

      console.log "^^^CHANNEL=#{channel}, DATA=#{message}" unless attributes?.aliveID? or attributes?.aliveId?

      #TEMPORARY ------start------
      unless channel is "bigbluebutton:webhook_events"
        if attributes?.header?.name is "whiteboard_draw_event" or attributes?.header?.name is "user_joined_event" or attributes?.header?.name is "user_left_event" 
         channel = "bigbluebutton:bridge"
      #TEMPORARY ------end------

      if channel is "bigbluebutton:bridge"
        if attributes?.header?.name is "user_joined_event"
          console.log "___#{attributes?.payload?.user?.name} is joining"
        @_redis_onBigbluebuttonBridge2(attributes)

      else if channel is "bigbluebutton:meeting:presentation"
        @_redis_onBigbluebuttonMeetingPresentation2(attributes)

      else
        # value of pub channel is used as the name of the SocketIO room to send to
        # apply the parameters to the socket event, and emit it on the channels
        #console.log "\n from within Websocket bridge:" + message + "\n"
        console.log "\nThe channel was strange:" + channel
        @_emitToClients2(channel, attributes)


  # When received a message on the channel "bigbluebutton:bridge"
  #
  # @param attributes [Array] follows the format of this example:
  #   `["183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377871468173","mvCur",0.608540925266904,0.298932384341637]`
  #   The first attribute is the meetingID
  # @private
  _redis_onBigbluebuttonBridge2: (attributes) ->
    console.log "(_redis_onBigbluebuttonBridge2): " + attributes?.header?.name #for debugging
    
    meetingID = attributes?.payload?.meeting?.id
    console.log "*meetingID: " + meetingID

    emit = =>
      # apply the parameters to the socket event, and emit it on the channels
      #attributes.splice(0, 1) # remove the meeting id from the params
      @_emitToClients2(meetingID, attributes)

    # When presenter in flex side sends the 'undo' event, remove the current shape from Redis
    # and publish the rest shapes to html5 users
    ###if attributes[1] is "undo"
      @redisAction.onUndo meetingID, (err, reply) =>
        @redisPublisher.publishShapes2 meetingID, null, (err) -> emit()###

    # When presenter in flex side sends the 'clrPaper' event, remove everything from Redis
    ###else if attributes[1] is "clrPaper"
      @redisAction.onClearPaper meetingID, (err, reply) => emit()###

    ###else
      emit()###
    emit()

  # When received a message on the channel "bigbluebutton:meeting:presentation"
  #
  # @private
  _redis_onBigbluebuttonMeetingPresentation2: (attributes) ->
    console.log "**_redis_onBigbluebuttonMeetingPresentation2"

    if attributes.messageKey is "CONVERSION_COMPLETED"
      meetingID = attributes.room
      @redisPublisher.publishSlides2 meetingID, null, =>
        @redisPublisher.publishViewBox meetingID


  # Emits a message to all clients connected in the given channel.
  #
  # @private
  _emitToClients2: (channel, message) -> #message is a JS Object
    console.log "in _emitToClients2:" unless message?.aliveID? or message?.aliveId?
    channelViewers = @io.sockets.in(channel) #channel is the same as meetingID

    #if the message has "header":{"name":"some_event_name"} use that name
    #otherwise look for "name":"some_event_name" in the top level of the message
    eventName = message?.header?.name or message?.name

    console.log "**message name**: " + eventName unless message?.aliveID? or message?.aliveId?
    console.log "channelViewers" + channelViewers[0] unless message?.aliveID? or message?.aliveId?
    #console.log "message" + message
    channelViewers.emit.apply(channelViewers, [eventName, message])


  # When a user connected to the web socket.
  # Several methods have callbacks but we don't need to wait for them all to run, they
  # can just be triggered and the messages will be sent sometime.
  #
  # @param socket [Object] the socket that generated the event
  # @private
  _socket_onUserConnected2: (socket) ->
    console.log("**userConnected2")
    sessionID = fromSocket2(socket, "sessionID")
    meetingID = fromSocket2(socket, "meetingID")
    console.log "__meetingID=" + meetingID
    @redisAction.isValidSession meetingID, sessionID, (err, reply) =>
      if !reply
        Logger.error "got invalid session for meeting #{meetingID}, session #{sessionID}"
      else
        username = fromSocket(socket, "username")
        socketID = socket.id
        socket.join meetingID # join the socket room with value of the meetingID
        socket.join sessionID # join the socket room with value of the sessionID

        Logger.info "got a valid session for meeting #{meetingID}, session #{sessionID}, username is '#{username}'"

        # add socket to list of sockets
        @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
          Logger.info "publishing the list of users for #{meetingID}"
          @redisPublisher.publishLoadUsers2 meetingID, null, =>
            @redisPublisher.publishPresenter(meetingID)

          numOfSockets = parseInt(properties.sockets, 10)
          numOfSockets += 1
          @redisStore.hset RedisKeys.getUserString(meetingID, sessionID), "sockets", numOfSockets

          # if the user is not refreshing, it means its the first time he's entering the session
          # all users should be notified
          # when the user is refreshing the page the other users don't have to be notified
          Logger.info "publishing user join for #{meetingID}"
          receivers = (if properties.refreshing is "false" then null else sessionID)
          @redisStore.hset RedisKeys.getUserString(meetingID, sessionID), "refreshing", false
          @redisPublisher.publishUserJoin2 meetingID, receivers, properties.pubID, properties.username, =>
            @redisPublisher.publishPresenter(meetingID, receivers)

            # publish everything else we need to update for the client
            Logger.info "publishing messages, slides and shapes to #{meetingID}, #{sessionID}"
            @redisPublisher.publishMessages2(meetingID, sessionID)
            @redisPublisher.publishSlides2 meetingID, sessionID, =>
              @redisPublisher.publishCurrentImagePath(meetingID)
              @redisPublisher.publishTool(meetingID, sessionID)
              @redisPublisher.publishShapes2(meetingID, sessionID)
              @redisPublisher.publishViewBox(meetingID, sessionID)



  # When a user disconnects from the socket
  #
  # @param socket [Object] the socket that generated the event
  # @private
  _socket_onUserDisconnected: (socket) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")

    # check if user is still in database
    @redisAction.isValidSession meetingID, sessionID, (err, isValid) =>
      if isValid
        username = fromSocket(socket, "username")
        socketID = socket.id
        @redisAction.updateUserProperties meetingID, sessionID, ["refreshing", true], (success) =>
          setTimeout (=>
            @redisAction.isValidSession meetingID, sessionID, (err, isValid) =>
              if isValid
                @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
                  numOfSockets = parseInt(properties.sockets, 10)
                  numOfSockets -= 1
                  if numOfSockets is 0
                    @redisAction.deleteUser meetingID, sessionID, (err, reply) =>
                      @redisPublisher.publishUserLeave meetingID, sessionID, properties.pubID
                  else
                    @redisAction.updateUserProperties meetingID, sessionID, ["sockets", numOfSockets]
              else
                @redisPublisher.publishUsernames(meetingID)

          ), 5000 # @todo a 5 sec timeout, really?? timeouts are bad, there must be a better solution.

  # When a user sends a chat message
  #
  # @param socket [Object] the socket that generated the event
  # @param msg [string] the message received
  # @private
  _socket_onChatMessage2: (socket, msg) ->
    msg = sanitizer.escape(msg)
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (err, reply) =>
      if reply
        if msg.length > config.maxChatLength
          @redisPublisher.publishChatMessageTooLong(meetingID, sessionID)
        else
          @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
            username = fromSocket(socket, "username")
            @redisPublisher.publishChatMessage2(meetingID, username, msg, properties.pubID)

            messageID = rack() # get a randomly generated id for the message
            @redisStore.rpush RedisKeys.getMessagesString(meetingID, null, null), messageID #store the messageID in the list of messages
            @redisStore.hmset RedisKeys.getMessageString(meetingID, null, null, messageID), "message", msg, "username", username, "userID", properties.pubID

  # When a user logs out
  #
  # @param socket [Object] the socket that generated the event
  # @private
  _socket_onLogout: (socket) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (err, isValid) =>
      if isValid

        @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
          @redisPublisher.publishUserLeave meetingID, null, properties.pubID

        # remove the user from the list of users
        @redisStore.srem RedisKeys.getUsersString(meetingID), sessionID, (numDeleted) =>

          # delete key from database
          @redisStore.del RedisKeys.getUserString(meetingID, sessionID), (reply) =>
            @redisPublisher.publishLogout(sessionID)
            socket.disconnect() # disconnect own socket

  # If a user requests all the shapes, publish the shapes to everyone.
  # Only reason this happens is when its fit changes.
  #
  # @param socket [Object] the socket that generated the event
  # @private
  # @todo review if we really need it
  _socket_onAllShapes: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisPublisher.publishShapes2(meetingID)

  # Returns a given attribute `attr` registered in the `socket`.
  #
  # @return {string} the value of the attribute requested
  # @internal
  fromSocket = (socket, attr) ->

    #console.log("\n***handshake**\n")
    #console.log(socket.handshake)
    #console.log("handshake end--\n")

    socket?.handshake?[attr]

  # Returns a given attribute `attr` registered in the `socket`.
  #
  # @return {string} the value of the attribute requested
  # @internal
  fromSocket2 = (socket, attr) ->

    ###console.log("\n***handshake**\n")
    console.log(socket.handshake)
    console.log("handshake end--\n")###

    socket?.handshake?[attr]

  # Returns whether the current user is the presenter or not.
  #
  # @return {boolean}
  # @internal
  isCurrentPresenter = (socket, presenterID) ->
    id = fromSocket(socket, "sessionID")
    id? and presenterID is id

  registerResponse = (method, err, reply, message="") ->
    Utils.registerResponse "RedisWebsocketBridge##{method}", err, reply, message
