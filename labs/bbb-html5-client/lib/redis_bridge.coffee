redis = require("redis")

config = require("../config")
Logger = require("./logger")
RedisKeys = require("../lib/redis_keys")
Utils = require("./utils")

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
  #
  # @param pattern [string] Matched pattern on Redis PubSub
  # @param channel [string] Channel the message was published on (socket room)
  # @param message [string] Message published (socket message data)
  # @private
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
  #
  # @param attributes [Array] follows the format of this example:
  #   `["183f0bf3a0982a127bdb8161e0c44eb696b3e75c-1377871468173","mvCur",0.608540925266904,0.298932384341637]`
  #   The first attribute is the meetingID
  # @private
  _onBigbluebuttonBridge: (attributes) ->
    meetingID = attributes[0]

    emit = =>
      # apply the parameters to the socket event, and emit it on the channels
      attributes.splice(0, 1) # remove the meeting id from the params
      @_emitToClients(meetingID, attributes)

    # Stores the current URL so the server can send it to the clients when they connect via websockets.
    # TODO: should this really be done by the HTML5 client?
    if attributes[1] is "changeslide"
      url = attributes[2]
      @redisAction.onChangeSlide url, (err, reply) -> emit()

    # When presenter in flex side sends the 'undo' event, remove the current shape from Redis
    # and publish the rest shapes to html5 users
    else if attributes[1] is "undo"
      @redisAction.onUndo meetingID, (err, reply) =>
        @websocket.publishShapes meetingID, (err) -> emit()

    # When presenter in flex side sends the 'clrPaper' event, remove everything from Redis
    else if attributes[1] is "clrPaper"
      @redisAction.onClearPaper meetingID, (err, reply) => emit()

    else
      emit()

  # When received a message on the channel "bigbluebutton:meeting:presentation"
  #
  # @private
  _onBigbluebuttonMeetingPresentation: (attributes) ->
    if attributes.messageKey is "CONVERSION_COMPLETED"
      meetingID = attributes.room
      @websocket.publishSlides meetingID, null, =>
        @websocket.publishViewBox meetingID

  # Emits a message to all clients connected
  #
  # @private
  _emitToClients: (channel, message) ->
    @websocket.emitToAll(channel, message)


#
# # Local methods
#

registerResponse = (method, err, reply, message="") ->
  Utils.registerResponse "RedisBridge##{method}", err, reply, message
