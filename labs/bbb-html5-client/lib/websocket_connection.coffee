sanitizer = require("sanitizer")
rack = require("hat").rack()

config = require("../config")
RedisKeys = require("./redis_keys")

moduleDeps = ["RedisAction", "RedisStore", "RedisPublisher"]

# Websocket module. Listens for messages from the clients and reacts accordingly.
# Also includes methods used to send messages to the clients
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
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # aram {Function} callback callback to call when finished
  # TODO: only external because it is called by RedisBridge
  # TODO: publishes to redis, maybe should be on RedisBridge
  publishShapes: (meetingID, sessionID, callback) ->
    shapes = []
    @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
      @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>
        @redisAction.getItems meetingID, presentationID, pageID, "currentshapes", (shapes) =>
          receivers = (if sessionID? then sessionID else meetingID)
          @pub.publish receivers, JSON.stringify(["all_shapes", shapes])
          callback?()

  # Publish viewbox from redis to appropriate clients
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # TODO: only external because it is called by RedisBridge
  # TODO: publishes to redis, maybe should be on RedisBridge
  publishViewBox: (meetingID, sessionID, callback) ->
    @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
      @redisAction.getViewBox meetingID, (viewBox) =>
        viewBox = JSON.parse(viewBox)
        receivers = (if sessionID? then sessionID else meetingID)
        @pub.publish receivers, JSON.stringify(["paper", viewBox[0], viewBox[1], viewBox[2], viewBox[3]])
        callback?()

  # Publish list of slides from redis to the appropriate clients
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # TODO: only external because it is called by RedisBridge
  # TODO: use a `for` instead of a `while`
  # TODO: publishes to redis, maybe should be on RedisBridge
  publishSlides: (meetingID, sessionID, callback) ->
    slides = []
    @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
      @redisAction.getPageIDs meetingID, presentationID, (presentationID, pageIDs) =>
        numOfSlides = pageIDs.length
        slideCount = 0
        i = 0

        while i < numOfSlides
          @redisAction.getPageImage meetingID, presentationID, pageIDs[i], (pageID, filename) =>
            @redisAction.getImageSize meetingID, presentationID, pageID, (width, height) =>
              slides.push ["bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename, width, height]
              if slides.length is numOfSlides
                receivers = (if sessionID? then sessionID else meetingID)
                @pub.publish receivers, JSON.stringify(["all_slides", slides])
                callback?()

          i++

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
      socket.on "prevslide", () => @_onPreviousSlide(socket)
      socket.on "nextslide", () => @_onNextSlide(socket)
      socket.on "makeShape", (shape, data) => @_onMakeShape(socket, shape, data)
      socket.on "updShape", (shape, data) => @_onUpdateShape(socket, shape, data)
      socket.on "mvCur", (x, y) => @_onMvCur(socket, x, y)
      socket.on "clrPaper", () => @_onClearPaper(socket)
      socket.on "setPresenter", (publicID) => @_onSetPresenter(socket, publicID)
      socket.on "paper", (cx, cy, sw, sh) => @_onPaper(socket, cx, cy, sw, sh)
      socket.on "zoom", (delta) => @_onZoom(socket, delta)
      socket.on "panStop", () => @_onPanStop(socket)
      socket.on "undo", () => @_onUndo(socket)
      socket.on "textDone", () => @_onTextDone(socket)
      socket.on "saveShape", (shape, data) => @_onSaveShape(socket, shape, data)
      socket.on "changeTool", (tool) => @_onChangeTool(socket, tool)
      socket.on "all_shapes", () => @_onAllShapes(socket)
      socket.on "fitToPage", (fit) => @_onFitToPage(socket, fit)

  # When a user connected to the web socket
  # TODO: several methods with callback that are not nested
  _onUserConnected: (socket, msg) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (reply) =>
      if reply
        username = fromSocket(socket, "username")
        socketID = socket.id
        socket.join meetingID # join the socket room with value of the meetingID
        socket.join sessionID # join the socket room with value of the sessionID

        # add socket to list of sockets
        @redisAction.getUserProperties meetingID, sessionID, (properties) =>
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
            # TODO: currentUrl is not a good name and maybe there's already this info on another key on redis
            @redisStore.get "currentUrl", (err, url) =>
              if err
                console.log err
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
    @redisAction.isValidSession meetingID, sessionID, (isValid) =>
      if isValid
        username = fromSocket(socket, "username")
        socketID = socket.id
        @redisAction.updateUserProperties meetingID, sessionID, ["refreshing", true], (success) =>
          setTimeout (=>
            @redisAction.isValidSession meetingID, sessionID, (isValid) =>
              if isValid
                @redisAction.getUserProperties meetingID, sessionID, (properties) =>
                  numOfSockets = parseInt(properties.sockets, 10)
                  numOfSockets -= 1
                  if numOfSockets is 0
                    @redisAction.deleteUser meetingID, sessionID, =>
                      @_publishUserLeave meetingID, sessionID, properties.pubID
                  else
                    @redisAction.updateUserProperties meetingID, sessionID, ["sockets", numOfSockets]
              else
                @_publishUsernames(meetingID)

          ), 5000 # TODO: a 5 sec timeout, really?? timeouts are bad, there must be a better solution.

  # When a user sends a chat message
  _onChatMessage: (socket, msg) ->
    msg = sanitizer.escape(msg)
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (reply) =>
      if reply
        if msg.length > config.maxChatLength
          @pub.publish sessionID, JSON.stringify(["msg", "System", "Message too long."])
        else
          username = fromSocket(socket, "username")
          @redisAction.getUserProperties meetingID, sessionID, (properties) =>
            @pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "msg", username, msg, properties.pubID])
            messageID = rack() # get a randomly generated id for the message

            # try later taking these nulls out and see if the function still works
            @redisStore.rpush RedisKeys.getMessagesString(meetingID, null, null), messageID #store the messageID in the list of messages
            @redisStore.hmset RedisKeys.getMessageString(meetingID, null, null, messageID), "message", msg, "username", username, "userID", properties.pubID

  # When a user logs out
  _onLogout: (socket) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.isValidSession meetingID, sessionID, (isValid) =>
      if isValid

        username = fromSocket(socket, "username")
        @redisAction.getUserProperties meetingID, sessionID, (properties) =>
          @_publishUserLeave meetingID, null, properties.pubID

        # remove the user from the list of users
        @redisStore.srem RedisKeys.getUsersString(meetingID), sessionID, (numDeleted) =>

          # delete key from database
          @redisStore.del RedisKeys.getUserString(meetingID, sessionID), (reply) =>
            @pub.publish sessionID, JSON.stringify(["logout"]) # send to all users on same session (all tabs)
            socket.disconnect() # disconnect own socket

  # When a user clicks to change to the previous slide
  _onPreviousSlide: (socket) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if presenterID is sessionID
        @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
          @redisAction.changeToPrevPage meetingID, presentationID, (pageID) =>
            @redisAction.getPageImage meetingID, presentationID, pageID, (pageID, filename) =>
              @pub.publish meetingID, JSON.stringify(["changeslide", "bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename])
              @pub.publish meetingID, JSON.stringify(["clrPaper"])
              @publishShapes meetingID

  # When a user clicks to change to the next slide
  _onPreviousSlide: (socket) ->
    sessionID = fromSocket(socket, "sessionID")
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if presenterID is sessionID
        @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
          @redisAction.changeToNextPage meetingID, presentationID, (pageID) =>
            @redisAction.getPageImage meetingID, presentationID, pageID, (pageID, filename) =>
              @pub.publish meetingID, JSON.stringify(["changeslide", "bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename])
              @pub.publish meetingID, JSON.stringify(["clrPaper"])
              @publishShapes meetingID

  # When a user draws a shape
  # @param {string} shape type of shape
  # @param {Object} data information needed to draw the shape
  # TODO: not being used yet because the client can't draw properly
  _onMakeShape: (socket, shape, data) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(socket, presenterID)
        @pub.publish meetingID, JSON.stringify(["makeShape", shape, data])

  # When a user updates a shape
  # @param {string} shape type of shape
  # @param {Object} data information needed to draw the shape
  # TODO: not being used yet because the client can't draw properly
  _onUpdateShape: (socket, shape, data) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(socket, presenterID)
        @pub.publish meetingID, JSON.stringify(["updShape", shape, data])

  # When the user (presenter) moves the cursor over the presentation
  # @param {[type]} x x coord of cursor as a percentage of width
  # @param {[type]} y y coord of cursor as a percentage of height
  _onMvCur: (socket, x, y) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(socket, presenterID)
        @pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "mvCur", x, y])

  # Then the user clears all drawings
  _onClearPaper: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    sessionID = fromSocket(socket, "sessionID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(socket, presenterID)
        @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
          @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>
            @redisAction.getItemIDs meetingID, presentationID, pageID, "currentshapes", (meetingID, presentationID, pageID, itemIDs, itemName) =>
              @redisAction.deleteItemList meetingID, presentationID, pageID, itemName, itemIDs

            @pub.publish meetingID, JSON.stringify(["clrPaper"])
            @_publishTool meetingID, sessionID

  # When the user wishes to set the presenter to another user
  # @param {[type]} publicID public ID of user to make presenter
  _onSetPresenter: (socket, publicID) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.setPresenterFromPublicID meetingID, publicID, (success) =>
      if success
        @pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "setPresenter", publicID])
      # TODO: else...

  # When a user is updating the viewBox of the paper
  # @param {number} cx x-offset from corner as a percentage of width
  # @param {number} cy y-offset from corner as a percentage of height
  # @param {number} sw width of page as a percentage of original width
  # @param {number} sh height of page as a percentage of original height
  _onPaper: (socket, cx, cy, sw, sh) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @pub.publish meetingID, JSON.stringify(["paper", cx, cy, sw, sh])
        if not sw and not sh
          @redisAction.getViewBox meetingID, (viewbox) ->
            viewbox = JSON.parse(viewbox)
            @redisAction.setViewBox meetingID, JSON.stringify([cx, cy, viewbox[2], viewbox[3]])
        else
          @redisAction.setViewBox meetingID, JSON.stringify([cx, cy, sw, sh])

  # When a user is zooming the presentation
  # @param {number} delta amount the mouse scroll has moved
  # TODO: not being used yet because the zoom doesn't work yet in the client
  _onZoom: (socket, delta) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @pub.publish meetingID, JSON.stringify(["zoom", delta])

  # When a user finishes panning
  # TODO: not being used yet because the panning doesn't work yet in the client
  _onPanStop: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @pub.publish meetingID, JSON.stringify(["panStop"])

  # Undoing the last shape
  _onUndo: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
          @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>

            # pop the last shape off the current list of shapes
            @redisStore.rpop RedisKeys.getCurrentShapesString(meetingID, presentationID, pageID), (err, reply) =>
              @publishShapes meetingID

  # Telling everyone the current text being draw in the whiteboard has been finished
  _onTextDone: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @pub.publish meetingID, JSON.stringify(["textDone"])

  # Saving a shape to Redis. Does not provide feedback to client(s)
  # @param {string} shape type of shape
  # @param {Object} data information needed to recreate shape
  _onSaveShape: (socket, shape, data) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
          @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>
            shapeID = rack() # get a randomly generated id for the shape
            @redisStore.rpush RedisKeys.getCurrentShapesString(meetingID, presentationID, pageID), shapeID
            @redisStore.hmset RedisKeys.getShapeString(meetingID, presentationID, pageID, shapeID), "shape", shape, "data", data, (err, reply) ->
              # TODO: this callback does nothing?

  # Changing the currently set tool.
  # Set the current tool in Redis, then publish the tool change to the members
  # @param {string} tool name of the tool to change to
  _onChangeTool: (socket, tool) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @redisAction.setCurrentTool meetingID, tool, (success) =>
          if success
            @pub.publish meetingID, JSON.stringify(["toolChanged", tool])

  # If a user requests all the shapes, publish the shapes to everyone.
  # Only reason this happens is when its fit changes. TODO: really? review
  _onAllShapes: (socket) ->
    meetingID = fromSocket(socket, "meetingID")
    @publishShapes(meetingID)

  # Updating the fit of the image to the whiteboard
  # @param {boolean} fit true for fit to page and false for fit to width
  _onFitToPage: (socket, fit) ->
    meetingID = fromSocket(socket, "meetingID")
    @redisAction.getPresenterSessionID meetingID, (presenterID) =>
      if isCurrentPresenter(presenterID)
        @pub.publish meetingID, JSON.stringify(["fitToPage", fit])



  # Publish usernames to all the sockets
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  # TODO: use a `for` instead of a `while`
  # TODO: 2 places calling the callback
  _publishUsernames: (meetingID, sessionID, callback) ->
    usernames = []
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

    @redisStore.scard RedisKeys.getUsersString(meetingID), (err, cardinality) =>
      if cardinality is "0"
        @redisAction.processMeeting meetingID
        callback?(false)

  # TODO: use a `for` instead of a `while`
  # TODO: 2 places calling the callback
  _publishLoadUsers: (meetingID, sessionID, callback) ->
    usernames = []
    @redisAction.getUsers meetingID, (users) =>
      i = users.length - 1
      while i >= 0
        usernames.push
          name: users[i].username
          id: users[i].pubID
        i--

      receivers = (if sessionID? then sessionID else meetingID)
      @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "load users", usernames])
      callback?(true)

    @redisStore.scard RedisKeys.getUsersString(meetingID), (err, cardinality) =>
      if cardinality is "0"
        @redisAction.processMeeting meetingID
        callback?(false)

  # TODO: 2 places calling the callback
  _publishUserJoin: (meetingID, sessionID, userid, username, callback) ->
    receivers = (if sessionID? then sessionID else meetingID)

    @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user join", userid, username, "VIEWER"])
    callback?(true)
    @redisStore.scard RedisKeys.getUsersString(meetingID), (err, cardinality) =>
      if cardinality is "0"
        @redisAction.processMeeting meetingID
        callback?(false)

  # TODO: 2 places calling the callback
  _publishUserLeave: (meetingID, sessionID, userid, callback) ->
    receivers = (if sessionID? then sessionID else meetingID)
    @pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user leave", userid])
    callback?(true)
    @redisStore.scard RedisKeys.getUsersString(meetingID), (err, cardinality) =>
      if cardinality is "0"
        @redisAction.processMeeting meetingID
        callback?(false)

  # Publish presenter to appropriate clients.
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  _publishPresenter: (meetingID, sessionID, callback) ->
    @redisAction.getPresenterPublicID meetingID, (publicID) =>
      receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
      @pub.publish receivers, JSON.stringify(["setPresenter", publicID])
      callback?(true)

  # Get all messages from redis and publish to a specific sessionID (user)
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {Function} callback callback to call when finished
  _publishMessages: (meetingID, sessionID, callback) ->
    messages = []
    @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
      @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>
        @redisAction.getItems meetingID, presentationID, pageID, "messages", (messages) =>
          receivers = (if sessionID? then sessionID else meetingID)
          @pub.publish receivers, JSON.stringify(["all_messages", messages])
          callback?()

  # Publish tool from redis to appropriate clients
  # @param {string} meetingID ID of the meeting
  # @param {string} sessionID ID of the user
  # @param {string} tool [description]
  # @param {Function} callback callback to call when finished
  _publishTool: (meetingID, sessionID, tool, callback) ->
    @redisAction.getCurrentTool meetingID, (tool) =>
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
