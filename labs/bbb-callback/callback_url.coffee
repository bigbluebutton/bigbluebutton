CallbackEmitter = require("./callback_emitter")

# The representation of a callback URL and its properties, taken from redis.
module.exports = class CallbackURL

  constructor: ->
    @queue = []
    @emitter = null

  mapFromRedis: (redisData) ->
    @url = redisData?.callbackURL
    @externalMeetingID = redisData?.externalMeetingID
    @active = redisData?.active
    @subscriptionID = redisData?.subscriptionID

  # TODO: not sure why this is necessary, but comes from the data in redis
  isActive: ->
    @active

  # Puts a new message in the queue. Will also trigger a processing in the queue so this
  # message might be processed instantly.
  enqueue: (message) ->
    console.log "CallbackURL: enqueueing message", JSON.stringify(message)
    @queue.push message
    @_processQueue()

  # Gets the first message in the queue and start an emitter to send it. Will only do it
  # if there is no emitter running already and if there is a message in the queue.
  _processQueue: ->
    message = @queue[0]
    return unless message? or @emitter?

    @emitter = new CallbackEmitter(@url, message)
    @emitter.start()

    @emitter.on "success", =>
      delete @emitter
      @queue.shift() # pop the first message just sent
      @_processQueue() # go to the next message

    # TODO: do what on error? maybe remove this callback url entirely?
    @emitter.on "error", (error) =>
      delete @emitter
      @queue.shift() # pop the first message just sent
      @_processQueue() # go to the next message
