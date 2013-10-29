sanitizer = require("sanitizer")
rack = require("hat").rack()

config = require("../config")
Logger = require("./logger")
RedisKeys = require("./redis_keys")

moduleDeps = ["RedisAction", "RedisStore", "RedisPublisher"]

# Websocket module. Listens for messages from the clients and reacts accordingly.
# Also includes methods used to send messages to the clients
# @todo should be more focused on websockets, but it's doing too much stuff on redis
module.exports = class WebsocketConnection

  constructor: (@io) ->
    config.modules.wait moduleDeps, =>
      @redisAction = config.modules.get("RedisAction")
      @redisStore = config.modules.get("RedisStore")

      # TODO: use methods from @redisBridge instead of using this publisher directly,
      #   so the publisher can be moved to be internal on RedisBridge since no other
      #   class will access it.
      @pub = config.modules.get("RedisPublisher")

      @_registerListeners()

  # Publish list of shapes from Redis to appropriate clients
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # @todo publishes to redis, maybe should be on RedisBridge
  publishShapes: (meetingID, sessionID, callback) ->
    shapes = []
    @redisAction.getCurrentPresentationID meetingID, (err, presentationID) =>
      @redisAction.getCurrentPageID meetingID, presentationID, (err, pageID) =>
        @redisAction.getItems meetingID, presentationID, pageID, "currentshapes", (err, shapes) =>
          receivers = (if sessionID? then sessionID else meetingID)
          @pub.publish receivers, JSON.stringify(["all_shapes", shapes])
          callback?(null)

  # Publish viewbox from redis to appropriate clients
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # @todo only external because it is called by RedisBridge
  # @todo publishes to redis, maybe should be on RedisBridge
  publishViewBox: (meetingID, sessionID, callback) ->
    @redisAction.getCurrentPresentationID meetingID, (err, presentationID) =>
      @redisAction.getViewBox meetingID, (err, viewBox) =>
        receivers = (if sessionID? then sessionID else meetingID)
        @pub.publish receivers, JSON.stringify(["paper", viewBox[0], viewBox[1], viewBox[2], viewBox[3]])
        callback?()

  # Publish list of slides from redis to the appropriate clients
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # @todo only external because it is called by RedisBridge
  # @todo use a `for` instead of a `while`
  # @todo publishes to redis, maybe should be on RedisBridge
  publishSlides: (meetingID, sessionID, callback) ->
    slides = []
    @redisAction.getCurrentPresentationID meetingID, (err, presentationID) =>
      @redisAction.getPageIDs meetingID, presentationID, (err, pageIDs) =>
        slideCount = 0
        pageIDs.forEach (pageID) =>
          @redisAction.getPageImage meetingID, presentationID, pageID, (err, filename) =>
            @redisAction.getImageSize meetingID, presentationID, pageID, (err, width, height) =>
              slides.push ["bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename, width, height]
              if slides.length is pageIDs.length
                receivers = (if sessionID? then sessionID else meetingID)
                @pub.publish receivers, JSON.stringify(["all_slides", slides])
                callback?()

  # Emits a message to all clients connected in the given channel.
  # @param {string} channel The name of the target channel, usually the meetingID
  # @param {object} message The message, usually an array.
  emitToAll: (channel, message) ->
    channelViewers = @io.sockets.in(channel)
    channelViewers.emit.apply(channelViewers, message)


  #
  # # Private methods
  #

  # Registers listeners to all socket IO events that can be emitted by the client
  # The events will always pass content to the server and the server will usually
  # treat this content and generate new events on redis.
  _registerListeners: () ->
    @io.sockets.on "connection", (socket) =>
      socket.on "user connect", () => @_onUserConnected(socket)
      socket.on "disconnect", () => @_onUserDisconnected(socket)
      socket.on "msg", (msg) => @_onChatMessage(socket, msg)
      socket.on "logout", () => @_onLogout(socket)
      socket.on "all_shapes", () => @_onAllShapes(socket)

  # When a user connected to the web socket
  #
  # @todo several methods with callback that are not nested
  _onUserConnected: (socket, msg) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (err, reply) =>
      if reply
        username = fromSocket(socket, "username")
        socketID = socket.id
        socket.join meetingID # join the socket room with value of the meetingID
        socket.join sessionID # join the socket room with value of the sessionID

        # add socket to list of sockets
        @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
          @_publishLoadUsers meetingID, null, =>
            @_publishPresenter meetingID

          numOfSockets = parseInt(properties.sockets, 10)
          numOfSockets += 1
          @redisStore.hset RedisKeys.getUserString(meetingID, sessionID), "sockets", numOfSockets
          if (properties.refreshing is "false") and (properties.dupSess is "false")

            # all of the next sessions created with this sessionID are duplicates
            @redisStore.hset RedisKeys.getUserString(meetingID, sessionID), "dupSess", true

            @_publishUserJoin meetingID, null, properties.pubID, properties.username, =>
              @_publishPresenter meetingID

          else
            @redisStore.hset RedisKeys.getUserString(meetingID, sessionID), "refreshing", false

            @_publishUserJoin meetingID, sessionID, properties.pubID, properties.username, =>
              @_publishPresenter meetingID, sessionID

          @_publishMessages meetingID, sessionID
          @publishSlides meetingID, sessionID, =>

            # after send 'all_slides' event, we have to load the current slide for new user by
            # getting the current presentation slide url and send the 'changeslide' event
            # @todo currentUrl is not a good name and maybe there's already this info on another key on redis
            @redisStore.get "currentUrl", (err, url) =>
              if err
                Logger.error err
              else
                @pub.publish meetingID, JSON.stringify(["changeslide", url])

            @_publishTool(meetingID, sessionID)
            @publishShapes(meetingID, sessionID)
            @publishViewBox(meetingID, sessionID)


  # When a user disconnects from the socket
  _onUserDisconnected: (socket) ->
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
                      @_publishUserLeave meetingID, sessionID, properties.pubID
                  else
                    @redisAction.updateUserProperties meetingID, sessionID, ["sockets", numOfSockets]
              else
                @_publishUsernames(meetingID)

          ), 5000 # @todo a 5 sec timeout, really?? timeouts are bad, there must be a better solution.

  # When a user sends a chat message
  _onChatMessage: (socket, msg) ->
    msg = sanitizer.escape(msg)
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (err, reply) =>
      if reply
        if msg.length > config.maxChatLength
          @pub.publish sessionID, JSON.stringify(["msg", "System", "Message too long."])
        else
          username = fromSocket(socket, "username")
          @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
            @pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "msg", username, msg, properties.pubID])
            messageID = rack() # get a randomly generated id for the message

            # try later taking these nulls out and see if the function still works
            @redisStore.rpush RedisKeys.getMessagesString(meetingID, null, null), messageID #store the messageID in the list of messages
            @redisStore.hmset RedisKeys.getMessageString(meetingID, null, null, messageID), "message", msg, "username", username, "userID", properties.pubID

  # When a user logs out
  _onLogout: (socket) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (err, isValid) =>
      if isValid

        username = fromSocket(socket, "username")
        @redisAction.getUserProperties meetingID, sessionID, (err, properties) =>
          @_publishUserLeave meetingID, null, properties.pubID

        # remove the user from the list of users
        @redisStore.srem RedisKeys.getUsersString(meetingID), sessionID, (numDeleted) =>

          # delete key from database
          @redisStore.del RedisKeys.getUserString(meetingID, sessionID), (reply) =>
            @pub.publish sessionID, JSON.stringify(["logout"]) # send to all users on same session (all tabs)
            socket.disconnect() # disconnect own socket

  # If a user requests all the shapes, publish the shapes to everyone.
  # Only reason this happens is when its fit changes. @todo really? review
  _onAllShapes: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    @publishShapes(meetingID)


  # Publish usernames to all the sockets
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # @todo use a `for` instead of a `while`
  # @todo 2 places calling the callback
  _publishUsernames: (meetingID, sessionID, callback) ->
    usernames = []
    # @TODO: @_getUsers doesn't exist, probably this method is never being called
    @_getUsers meetingID, (users) =>
      i = users.length - 1
      while i >= 0
        usernames.push
          name: users[i].username
          id: users[i].pubID
        i--

      receivers = (if sessionID? then sessionID else meetingID)
      @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user list change", usernames])
      callback?(true)

  # @todo use a `for` instead of a `while`
  # @todo 2 places calling the callback
  _publishLoadUsers: (meetingID, sessionID, callback) ->
    usernames = []
    @redisAction.getUsers meetingID, (err, users) =>
      i = users.length - 1
      while i >= 0
        usernames.push
          name: users[i].username
          id: users[i].pubID
        i--

      receivers = (if sessionID? then sessionID else meetingID)
      @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "load users", usernames])
      callback?(true)

  # @todo 2 places calling the callback
  _publishUserJoin: (meetingID, sessionID, userid, username, callback) ->
    receivers = (if sessionID? then sessionID else meetingID)
    @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user join", userid, username, "VIEWER"])
    callback?(true)

  # @todo 2 places calling the callback
  _publishUserLeave: (meetingID, sessionID, userid, callback) ->
    receivers = (if sessionID? then sessionID else meetingID)
    @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user leave", userid])
    callback?(true)

  # Publish presenter to appropriate clients.
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  _publishPresenter: (meetingID, sessionID, callback) ->
    @redisAction.getPresenterPublicID meetingID, (err, publicID) =>
      receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
      @pub.publish receivers, JSON.stringify(["setPresenter", publicID])
      callback?(true)

  # Get all messages from redis and publish to a specific sessionID (user)
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  _publishMessages: (meetingID, sessionID, callback) ->
    messages = []
    @redisAction.getCurrentPresentationID meetingID, (err, presentationID) =>
      @redisAction.getCurrentPageID meetingID, presentationID, (err, pageID) =>
        @redisAction.getItems meetingID, presentationID, pageID, "messages", (err, messages) =>
          receivers = (if sessionID? then sessionID else meetingID)
          @pub.publish receivers, JSON.stringify(["all_messages", messages])
          callback?()

  # Publish tool from redis to appropriate clients
  #
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {string} tool [description]
  # @param {Function} callback callback to call when finished
  _publishTool: (meetingID, sessionID, tool, callback) ->
    @redisAction.getCurrentTool meetingID, (err, tool) =>
      receivers = (if sessionID? then sessionID else meetingID)
      @pub.publish receivers, JSON.stringify(["toolChanged", tool])
      callback?()


# Returns a given attribute `attr` registered in the `socket`.
# @return {string} the value of the attribute requested
fromSocket = (socket, attr) ->
  socket.handshake[attr]

# Returns whether the current user is the presenter or not.
# @return {boolean}
isCurrentPresenter = (socket, presenterID) ->
  presenterID is fromSocket(socket, "sessionID")
