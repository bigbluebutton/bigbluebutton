CallbackEmitter = require("./callback_emitter")

# The database of hooks.
db = {}
nextId = 1

# The representation of a hook and its properties. Stored in memory and persisted
# to redis.
# TODO: at some point the queue needs to be cleared, or we need a size limit on it
module.exports = class Hook

  # @initialize = ->
  #   # get hooks from redis

  constructor: ->
    @id = null
    @callbackURL = null
    @externalMeetingID = null
    @queue = []
    @emitter = null

  saveSync: ->
    db[@id] = this
    db[@id]

  destroySync: ->
    Hook.destroySync @id

  # mapFromRedis: (redisData) ->
  #   @callbackURL = redisData?.callbackURL
  #   @externalMeetingID = redisData?.externalMeetingID
  #   @id = redisData?.subscriptionID

  # Puts a new message in the queue. Will also trigger a processing in the queue so this
  # message might be processed instantly.
  enqueue: (message) ->
    console.log "Hook: enqueueing message", message
    @queue.push message
    @_processQueue()

  # Gets the first message in the queue and start an emitter to send it. Will only do it
  # if there is no emitter running already and if there is a message in the queue.
  _processQueue: ->
    message = @queue[0]
    return unless message? or @emitter?

    @emitter = new CallbackEmitter(@callbackURL, message)
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

  @addSubscription = (callbackURL, meetingID=null, callback) ->
    hook = Hook.findByCallbackURLSync(callbackURL)
    if hook?
      callback?(new Error("There is already a subscription for this callback URL"), hook)
    else
      hook = new Hook()
      hook.id = nextId++
      hook.callbackURL = callbackURL
      hook.externalMeetingID = meetingID
      hook.saveSync()
      callback?(null, hook)

  @removeSubscription = (subscriptionID, callback) ->
    hook = Hook.getSync(subscriptionID)
    if hook?
      hook.destroySync()
      callback?(null, true)
    else
      callback?(null, false)

  @countSync = ->
    Object.keys(db).length

  @getSync = (id) ->
    db[id]

  @firstSync = ->
    keys = Object.keys(db)
    if keys.length > 0
      db[keys[0]]
    else
      null

  @allSync = ->
    arr = Object.keys(db).reduce((arr, id) ->
      arr.push db[id]
      arr
    , [])
    arr

  @destroySync = (id) ->
    if db[id]
      delete db[id]
      true
    else
      false

  @clearSync = ->
    for id of db
      delete db[id]
    db = {}

  @findByCallbackURLSync = (callbackURL) ->
    for id of db
      if db[id].callbackURL is callbackURL
        return db[id]
