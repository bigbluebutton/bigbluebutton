redis = require("redis")

config = require("../config")
Logger = require("./logger")
RedisKeys = require("../lib/redis_keys")

moduleDeps = ["RedisAction", "WebsocketConnection", "RedisStore", "RedisPublisher"]

# Redis pub/sub actions: listens for events on redis and takes the necessary actions
module.exports = class RedisBridge

  constructor: (@io) ->
    config.modules.wait moduleDeps, =>
      @redisAction = config.modules.get("RedisAction")
      @redisStore = config.modules.get("RedisStore")
      @websocket = config.modules.get("WebsocketConnection")

      @pub = config.modules.get("RedisPublisher")
      @sub = redis.createClient()
      @subscriptions = ["*"]
      @sub.psubscribe.apply(@sub, @subscriptions)

      @_registerListeners()


  #
  # # Private methods
  #

  # Listens for messages published to redis
  # @param  {String} pattern Matched pattern on Redis PubSub
  # @param  {String} channel Channel the pmessage was published on (socket room)
  # @param  {String} message Message published (socket message data)
  _registerListeners: ->
    @sub.on "pmessage", (pattern, channel, message) =>
      attributes = JSON.parse(message)
      Logger.info "message from redis on channel:#{channel}, data:#{message}"

      if channel is "bigbluebutton:bridge"
        @_onBigbluebuttonBridge(attributes)

      else if channel is "bigbluebutton:meeting:presentation"
        @_onBigbluebuttonMeetingPresentation(attributes)

      else
        # value of pub channel is used as the name of the SocketIO room to send to
        # apply the parameters to the socket event, and emit it on the channels
        @_emitToClients(channel, JSON.parse(message))

  # When received a message on the channel "bigbluebutton:bridge"
  # `attributes` follows the format of this example:
  #   ["183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377871468173","mvCur",0.608540925266904,0.298932384341637]
  # The first attribute is the meetingID
  _onBigbluebuttonBridge: (attributes) ->
    meetingID = attributes[0]

    # Stores the current URL so the server can send it to the clients when they connect via
    # websockets.
    # TODO: "currentUrl" is a bad name for a key, there's probably already a key with the current page
    # TODO: use an action in RedisAction to do this
    if attributes[1] is "changeslide"
      url = attributes[2]
      @redisStore.set "currentUrl", url, (err, reply) ->
        registerSuccess("on changeslide", "set current page url to #{url}") if reply
        registerError("on changeslide", err) if err?

    # When presenter in flex side sends the 'undo' event, remove the current shape from Redis
    # and publish the rest shapes to html5 users
    # TODO: use an action in RedisAction to do this
    if attributes[1] is "undo"
      @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
        @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>
          @redisStore.rpop RedisKeys.getCurrentShapesString(meetingID, presentationID, pageID), (err, reply) =>
            @websocket.publishShapes meetingID

    # When presenter in flex side sends the 'clrPaper' event, remove everything from Redis
    # TODO: use an action in RedisAction to do this
    if attributes[1] is "clrPaper"
      @redisAction.getCurrentPresentationID meetingID, (presentationID) =>
        @redisAction.getCurrentPageID meetingID, presentationID, (pageID) =>
          @redisAction.getItemIDs meetingID, presentationID, pageID, "currentshapes", (meetingID, presentationID, pageID, itemIDs, itemName) =>
            @redisAction.deleteItemList meetingID, presentationID, pageID, itemName, itemIDs

    # apply the parameters to the socket event, and emit it on the channels
    attributes.splice(0, 1) # remove the meeting id from the params
    @_emitToClients(meetingID, attributes)


  # When received a message on the channel "bigbluebutton:meeting:presentation"
  _onBigbluebuttonMeetingPresentation: (attributes) ->
    if attributes.messageKey is "CONVERSION_COMPLETED"
      meetingID = attributes.room
      @pub.publish meetingID, JSON.stringify(["clrPaper"])
      @websocket.publishSlides meetingID, null, =>
        @websocket.publishViewBox meetingID
        @pub.publish meetingID, JSON.stringify(["uploadStatus", "Upload succeeded", true])

  # Emits a message to all clients connected
  _emitToClients: (channel, message) ->
    @websocket.emitToAll(channel, message)


#
# # Local methods
#

registerError = (method, err, message="") ->
  Logger.error "error on RedisBridge##{method}:", message, err

registerSuccess = (method, message="") ->
  Logger.info "success on RedisAction##{method}:", message
