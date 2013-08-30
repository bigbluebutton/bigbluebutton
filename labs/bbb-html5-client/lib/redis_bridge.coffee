redis = require("redis")

config = require("../config")
RedisKeys = require("../lib/redis_keys")

# Redis pub/sub actions: listens for events on redis and takes the necessary actions
module.exports = class RedisBridge
  constructor: (@io) ->
    @store = redis.createClient()
    @pub = redis.createClient()
    @sub = redis.createClient()
    @subscriptions = ["*"]
    @sub.psubscribe.apply(@sub, @subscriptions)
    @_registerListeners()

    # TODO: review global variables
    config.store = @store
    config.redis.pub = @pub
    config.redis.sub = @sub


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
      console.log "message received from redis:", channel, message

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
      config.store.set "currentUrl", url, (err, reply) ->
        registerSuccess("on changeslide", "set current page url to #{url}") if reply
        registerError("on changeslide", err) if err?

    # When presenter in flex side sends the 'undo' event, remove the current shape from Redis
    # and publish the rest shapes to html5 users
    # TODO: use an action in RedisAction to do this
    if attributes[1] is "undo"
      config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
        config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
          config.store.rpop RedisKeys.getCurrentShapesString(meetingID, presentationID, pageID), (err, reply) ->
            config.socketAction.publishShapes meetingID

    # When presenter in flex side sends the 'clrPaper' event, remove everything from Redis
    # TODO: use an action in RedisAction to do this
    if attributes[1] is "clrPaper"
      config.redisAction.getCurrentPresentationID meetingID, (presentationID) ->
        config.redisAction.getCurrentPageID meetingID, presentationID, (pageID) ->
          config.redisAction.getItemIDs meetingID, presentationID, pageID, "currentshapes", (meetingID, presentationID, pageID, itemIDs, itemName) ->
            config.redisAction.deleteItemList meetingID, presentationID, pageID, itemName, itemIDs

    # apply the parameters to the socket event, and emit it on the channels
    attributes.splice(0, 1) # remove the meeting id from the params
    @_emitToClients(meetingID, attributes)


  # When received a message on the channel "bigbluebutton:meeting:presentation"
  _onBigbluebuttonMeetingPresentation: (attributes) ->
    if attributes.messageKey is "CONVERSION_COMPLETED"
      meetingID = attributes.room
      @pub.publish meetingID, JSON.stringify(["clrPaper"])
      config.socketAction.publishSlides meetingID, null, =>
        config.socketAction.publishViewBox meetingID
        @pub.publish meetingID, JSON.stringify(["uploadStatus", "Upload succeeded", true])

  # Emits a message to all clients connected
  _emitToClients: (channel, message) ->
    config.socketAction.emitToAll(channel, message)


#
# # Local methods
#

registerError = (method, err, message="") ->
  console.log "error on RedisBridge##{method}:", message, err

registerSuccess = (method, message="") ->
  console.log "success on RedisAction##{method}:", message
