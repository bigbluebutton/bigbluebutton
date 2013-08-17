sanitizer = require("sanitizer")
rack = require("hat").rack()

config = require("../config")

###
Publish usernames to all the sockets
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishUsernames = (meetingID, sessionID, callback) ->
  usernames = []
  config.redisAction.getUsers meetingID, (users) ->
    i = users.length - 1

    while i >= 0
      usernames.push
        name: users[i].username
        id: users[i].pubID

      i--
    receivers = (if sessionID isnt `undefined` then sessionID else meetingID)

    #config.redis.pub.publish(receivers, JSON.stringify(['user list change', usernames]));
    config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user list change", usernames])
    callback?(true)

  config.store.scard config.redisAction.getUsersString(meetingID), (err, cardinality) ->
    if cardinality is "0"
      config.redisAction.processMeeting meetingID
      callback?(false)

exports.publishLoadUsers = (meetingID, sessionID, callback) ->
  usernames = []
  config.redisAction.getUsers meetingID, (users) ->
    i = users.length - 1

    while i >= 0
      usernames.push
        name: users[i].username
        id: users[i].pubID

      i--
    receivers = (if sessionID isnt `undefined` then sessionID else meetingID)

    #config.redis.pub.publish(receivers, JSON.stringify(['user list change', usernames]));
    config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "load users", usernames])
    callback?(true)

  config.store.scard config.redisAction.getUsersString(meetingID), (err, cardinality) ->
    if cardinality is "0"
      config.redisAction.processMeeting meetingID
      callback?(false)

exports.publishUserJoin = (meetingID, sessionID, userid, username, callback) ->
  receivers = (if sessionID isnt `undefined` then sessionID else meetingID)

  #config.redis.pub.publish(receivers, JSON.stringify(['user list change', usernames]));
  config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user join", userid, username, "VIEWER"])
  callback?(true)
  config.store.scard config.redisAction.getUsersString(meetingID), (err, cardinality) ->
    if cardinality is "0"
      config.redisAction.processMeeting meetingID
      callback?(false)

exports.publishUserLeave = (meetingID, sessionID, userid, callback) ->
  receivers = (if sessionID isnt `undefined` then sessionID else meetingID)

  #config.redis.pub.publish(receivers, JSON.stringify(['user list change', usernames]));
  config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([receivers, "user leave", userid])
  callback?(true)
  config.store.scard config.redisAction.getUsersString(meetingID), (err, cardinality) ->
    if cardinality is "0"
      config.redisAction.processMeeting meetingID
      callback?(false)

###
Publish presenter to appropriate clients.
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishPresenter = (meetingID, sessionID, callback) ->
  config.redisAction.getPresenterPublicID meetingID, (publicID) ->
    receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
    config.redis.pub.publish receivers, JSON.stringify(["setPresenter", publicID])
    callback?(true)

###
Get all messages from Redis and publish to a specific sessionID (user)
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishMessages = (meetingID, sessionID, callback) ->
  messages = []
  config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
    config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
      config.redisAction.getItems meetingID, presentationID, pageID, "messages", (messages) ->
        receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
        config.redis.pub.publish receivers, JSON.stringify(["all_messages", messages])
        callback?()

###
Publish list of slides from Redis to the appropriate clients
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishSlides = (meetingID, sessionID, callback) ->
  slides = []
  config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
    config.redisAction.getPageIDs meetingID, presentationID, (presentationID, pageIDs) ->
      numOfSlides = pageIDs.length
      slideCount = 0
      i = 0

      while i < numOfSlides
        config.redisAction.getPageImage meetingID, presentationID, pageIDs[i], (pageID, filename) ->
          config.redisAction.getImageSize meetingID, presentationID, pageID, (width, height) ->

            #slides.push(['images/presentation' +presentationID+'/'+filename, width, height]);
            slides.push ["bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename, width, height]
            if slides.length is numOfSlides
              receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
              config.redis.pub.publish receivers, JSON.stringify(["all_slides", slides])
              callback?()

        i++

###
Publish list of shapes from Redis to appropriate clients
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishShapes = (meetingID, sessionID, callback) ->
  shapes = []
  config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
    config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
      config.redisAction.getItems meetingID, presentationID, pageID, "currentshapes", (shapes) ->
        receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
        config.redis.pub.publish receivers, JSON.stringify(["all_shapes", shapes])
        callback?()

###
Publish viewbox from Redis to appropriate clients
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishViewBox = (meetingID, sessionID, callback) ->
  config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
    config.redisAction.getViewBox meetingID, (viewBox) ->
      viewBox = JSON.parse(viewBox)
      receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
      config.redis.pub.publish receivers, JSON.stringify(["paper", viewBox[0], viewBox[1], viewBox[2], viewBox[3]])
      callback?()

###
Publish tool from Redis to appropriate clients
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {string} tool [description]
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishTool = (meetingID, sessionID, tool, callback) ->
  config.redisAction.getCurrentTool meetingID, (tool) ->
    receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
    config.redis.pub.publish receivers, JSON.stringify(["toolChanged", tool])
    callback?()

###
Publish viewbox from Redis to appropriate clients
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishViewBox = (meetingID, sessionID, callback) ->
  config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
    config.redisAction.getViewBox meetingID, (viewBox) ->
      viewBox = JSON.parse(viewBox)
      receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
      config.redis.pub.publish receivers, JSON.stringify(["paper", viewBox[0], viewBox[1], viewBox[2], viewBox[3]])
      callback?()

###
Publish tool from Redis to appropriate clients
@param {string} meetingID ID of the meeting
@param {string} sessionID ID of the user
@param {string} tool [description]
@param {Function} callback callback to call when finished
@return {undefined} publish to Redis PubSub
###
exports.publishTool = (meetingID, sessionID, tool, callback) ->
  config.redisAction.getCurrentTool meetingID, (tool) ->
    receivers = (if sessionID isnt `undefined` then sessionID else meetingID)
    config.redis.pub.publish receivers, JSON.stringify(["toolChanged", tool])
    callback?()


###
All socket IO events that can be emitted by the client
@param {[type]} socket [description]
###
exports.SocketOnConnection = (socket) ->

  # When a user sends a message...
  socket.on "msg", (msg) ->
    msg = sanitizer.escape(msg)
    handshake = socket.handshake
    sessionID = handshake.sessionID
    meetingID = handshake.meetingID
    config.redisAction.isValidSession meetingID, sessionID, (reply) ->
      if reply
        if msg.length > config.maxChatLength
          config.redis.pub.publish sessionID, JSON.stringify(["msg", "System", "Message too long."])
        else
          username = handshake.username
          config.redisAction.getUserProperties meetingID, sessionID, (properties) ->
            config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "msg", username, msg, properties.pubID])
            messageID = rack() #get a randomly generated id for the message

            #try later taking these nulls out and see if the function still works
            config.store.rpush config.redisAction.getMessagesString(meetingID, null, null), messageID #store the messageID in the list of messages
            config.store.hmset config.redisAction.getMessageString(meetingID, null, null, messageID), "message", msg, "username", username, "userID", properties.pubID

  ###
  When a user connects to the socket...
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "user connect", ->
    handshake = socket.handshake
    sessionID = handshake.sessionID
    meetingID = handshake.meetingID
    config.redisAction.isValidSession meetingID, sessionID, (reply) ->
      if reply
        username = handshake.username
        socketID = socket.id
        socket.join meetingID #join the socket Room with value of the meetingID
        socket.join sessionID #join the socket Room with value of the sessionID

        #add socket to list of sockets.
        config.redisAction.getUserProperties meetingID, sessionID, (properties) ->
          config.socketAction.publishLoadUsers meetingID, null, ->
            config.socketAction.publishPresenter meetingID

          numOfSockets = parseInt(properties.sockets, 10)
          numOfSockets += 1
          config.store.hset config.redisAction.getUserString(meetingID, sessionID), "sockets", numOfSockets
          if (properties.refreshing is "false") and (properties.dupSess is "false")

            #all of the next sessions created with this sessionID are duplicates
            config.store.hset config.redisAction.getUserString(meetingID, sessionID), "dupSess", true

            #config.socketAction.publishUsernames(meetingID, null, function() {
            #              config.socketAction.publishPresenter(meetingID);
            #            });
            config.socketAction.publishUserJoin meetingID, null, properties.pubID, properties.username, ->
              config.socketAction.publishPresenter meetingID

          else
            config.store.hset config.redisAction.getUserString(meetingID, sessionID), "refreshing", false

            #config.socketAction.publishUsernames(meetingID, sessionID, function() {
            #             config.socketAction.publishPresenter(meetingID, sessionID);
            #           });
            config.socketAction.publishUserJoin meetingID, sessionID, properties.pubID, properties.username, ->
              config.socketAction.publishPresenter meetingID, sessionID

          config.socketAction.publishMessages meetingID, sessionID
          config.socketAction.publishSlides meetingID, sessionID, ->

            # after send 'all_slides' event, we have to load the current slide for new user by
            # getting the current presentation slide url and send the 'changeslide' event
            config.store.get "currentUrl", (err, url) ->
              if err
                console.log err
              else
                config.redis.pub.publish meetingID, JSON.stringify(["changeslide", url])

            config.socketAction.publishTool meetingID, sessionID
            config.socketAction.publishShapes meetingID, sessionID
            config.socketAction.publishViewBox meetingID, sessionID

  ###
  When a user disconnects from the socket...
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "disconnect", ->
    handshake = socket.handshake
    sessionID = handshake.sessionID
    meetingID = handshake.meetingID

    #check if user is still in database
    config.redisAction.isValidSession meetingID, sessionID, (isValid) ->
      if isValid
        username = handshake.username
        socketID = socket.id
        config.redisAction.updateUserProperties meetingID, sessionID, ["refreshing", true], (success) ->
          setTimeout (->

            #in one second, check again...
            config.redisAction.isValidSession meetingID, sessionID, (isValid) ->
              if isValid
                config.redisAction.getUserProperties meetingID, sessionID, (properties) ->
                  numOfSockets = parseInt(properties.sockets, 10)
                  numOfSockets -= 1
                  if numOfSockets is 0
                    config.redisAction.deleteUser meetingID, sessionID, ->

                      #config.socketAction.publishUsernames(meetingID);
                      config.socketAction.publishUserLeave meetingID, sessionID, properties.pubID

                  else
                    config.redisAction.updateUserProperties meetingID, sessionID, ["sockets", numOfSockets]

              else
                config.socketAction.publishUsernames meetingID


          #config.socketAction.publishPresenter(meetingID, sessionID);
          ), 5000

  ###
  When the user logs out
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "logout", ->
    handshake = socket.handshake
    sessionID = handshake.sessionID
    meetingID = handshake.meetingID
    config.redisAction.isValidSession meetingID, sessionID, (isValid) ->
      if isValid

        #initialize local variables
        username = handshake.username
        config.redisAction.getUserProperties meetingID, sessionID, (properties) ->
          config.socketAction.publishUserLeave meetingID, null, properties.pubID

        #remove the user from the list of users
        config.store.srem config.redisAction.getUsersString(meetingID), sessionID, (numDeleted) ->

          #delete key from database
          config.store.del config.redisAction.getUserString(meetingID, sessionID), (reply) ->
            config.redis.pub.publish sessionID, JSON.stringify(["logout"]) #send to all users on same session (all tabs)
            #config.socketAction.publishUserLeave(meetingID, sessionID, sessionID);
            socket.disconnect() #disconnect own socket

  #config.socketAction.publishUsernames(meetingID);

  ###
  A user clicks to change to previous slide
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "prevslide", ->
    handshake = socket.handshake
    sessionID = handshake.sessionID
    meetingID = handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is sessionID
        config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
          config.redisAction.changeToPrevPage meetingID, presentationID, (pageID) ->
            config.redisAction.getPageImage meetingID, presentationID, pageID, (pageID, filename) ->

              #config.redis.pub.publish(meetingID, JSON.stringify(['changeslide', 'images/presentation/' + presentationID + '/'+filename]));
              config.redis.pub.publish meetingID, JSON.stringify(["changeslide", "bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename])
              config.redis.pub.publish meetingID, JSON.stringify(["clrPaper"])
              config.socketAction.publishShapes meetingID

  ###
  A user clicks to change to next slide
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "nextslide", ->
    handshake = socket.handshake
    sessionID = handshake.sessionID
    meetingID = handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is sessionID
        config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
          config.redisAction.changeToNextPage meetingID, presentationID, (pageID) ->
            config.redisAction.getPageImage meetingID, presentationID, pageID, (pageID, filename) ->

              #config.redis.pub.publish(meetingID, JSON.stringify(['changeslide', 'images/presentation/' + presentationID + '/'+filename]));
              config.redis.pub.publish meetingID, JSON.stringify(["changeslide", "bigbluebutton/presentation/" + meetingID + "/" + meetingID + "/" + presentationID + "/png/" + filename])
              config.redis.pub.publish meetingID, JSON.stringify(["clrPaper"])
              config.socketAction.publishShapes meetingID

  ###
  When a rectangle creation event is received
  @param {string} shape type of shape
  @param {Object} data information needed to draw the shape
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "makeShape", (shape, data) ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish meetingID, JSON.stringify(["makeShape", shape, data])  if presenterID is socket.handshake.sessionID

  ###
  When a update shape event is received
  @param {string} shape type of shape
  @param {Object} data information needed to draw the shape
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "updShape", (shape, data) ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish meetingID, JSON.stringify(["updShape", shape, data])  if presenterID is socket.handshake.sessionID

  ###
  When a cursor move event is received
  @param {[type]} x x coord of cursor as a percentage of width
  @param {[type]} y y coord of cursor as a percentage of height
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "mvCur", (x, y) ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "mvCur", x, y])  if presenterID is socket.handshake.sessionID

  ###
  When a clear Paper event is received
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "clrPaper", ->
    meetingID = socket.handshake.meetingID
    sessionID = socket.handshake.sessionID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is socket.handshake.sessionID
        config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
          config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
            config.redisAction.getItemIDs meetingID, presentationID, pageID, "currentshapes", (meetingID, presentationID, pageID, itemIDs, itemName) ->
              config.redisAction.deleteItemList meetingID, presentationID, pageID, itemName, itemIDs

            config.redis.pub.publish meetingID, JSON.stringify(["clrPaper"])
            config.socketAction.publishTool meetingID, sessionID

  ###
  When the user wishes to set the presenter to another user
  @param {[type]} publicID public ID of user to make presenter
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "setPresenter", (publicID) ->
    console.log "setting presenter to" + publicID
    meetingID = socket.handshake.meetingID
    config.redisAction.setPresenterFromPublicID meetingID, publicID, (success) ->
      config.redis.pub.publish "bigbluebutton:bridge", JSON.stringify([meetingID, "setPresenter", publicID])  if success

  ###
  When a user is updating the viewBox of the paper
  @param {number} cx x-offset from corner as a percentage of width
  @param {number} cy y-offset from corner as a percentage of height
  @param {number} sw width of page as a percentage of original width
  @param {number} sh height of page as a percentage of original height
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "paper", (cx, cy, sw, sh) ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is socket.handshake.sessionID
        config.redis.pub.publish socket.handshake.meetingID, JSON.stringify(["paper", cx, cy, sw, sh])
        if not sw and not sh
          config.redisAction.getViewBox socket.handshake.meetingID, (viewbox) ->
            viewbox = JSON.parse(viewbox)
            config.redisAction.setViewBox socket.handshake.meetingID, JSON.stringify([cx, cy, viewbox[2], viewbox[3]])

        else
          config.redisAction.setViewBox socket.handshake.meetingID, JSON.stringify([cx, cy, sw, sh])

  ###
  When a user is zooming
  @param {number} delta amount the mouse scroll has moved
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "zoom", (delta) ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish meetingID, JSON.stringify(["zoom", delta])  if presenterID is socket.handshake.sessionID

  ###
  When a user finishes panning
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "panStop", ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish meetingID, JSON.stringify(["panStop"])  if presenterID is socket.handshake.sessionID

  ###
  Undoing the last shape
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "undo", ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is socket.handshake.sessionID
        config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
          config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->

            #pop the last shape off the current list of shapes
            config.store.rpop config.redisAction.getCurrentShapesString(meetingID, presentationID, pageID), (err, reply) ->
              config.socketAction.publishShapes meetingID

  ###
  Telling everyone the current text has been finished
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "textDone", ->
    meetingID = socket.handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish meetingID, JSON.stringify(["textDone"])  if presenterID is socket.handshake.sessionID

  ###
  Saving a shape to Redis. Does not provide feedback to client(s)
  @param {string} shape type of shape
  @param {Object} data information needed to recreate shape
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "saveShape", (shape, data) ->
    handshake = socket.handshake
    meetingID = handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is handshake.sessionID
        config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
          config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
            shapeID = rack() #get a randomly generated id for the shape
            config.store.rpush config.redisAction.getCurrentShapesString(meetingID, presentationID, pageID), shapeID
            config.store.hmset config.redisAction.getShapeString(meetingID, presentationID, pageID, shapeID), "shape", shape, "data", data, (err, reply) ->

  ###
  Changing the currently set tool.
  Set the current tool in Redis, then publish
  the tool change to the members
  @param {string} tool name of the tool to change to
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "changeTool", (tool) ->
    handshake = socket.handshake
    meetingID = handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      if presenterID is socket.handshake.sessionID
        config.redisAction.setCurrentTool meetingID, tool, (success) ->
          config.redis.pub.publish meetingID, JSON.stringify(["toolChanged", tool])  if success

  ###
  If a user requests all the shapes,
  publish the shapes to everyone.
  Only reason this happens is when its fit changes.
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "all_shapes", ->
    handshake = socket.handshake
    meetingID = handshake.meetingID
    sessionID = handshake.sessionID
    config.socketAction.publishShapes meetingID

  ###
  Updating the fit of the image to the whiteboard
  @param {boolean} fit true for fit to page and false for fit to width
  @return {undefined} publish to Redis PubSub
  ###
  socket.on "fitToPage", (fit) ->
    handshake = socket.handshake
    meetingID = handshake.meetingID
    config.redisAction.getPresenterSessionID meetingID, (presenterID) ->
      config.redis.pub.publish meetingID, JSON.stringify(["fitToPage", fit])  if presenterID is socket.handshake.sessionID
