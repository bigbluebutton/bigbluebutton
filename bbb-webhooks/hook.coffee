_ = require("lodash")
async = require("async")
redis = require("redis")

config = require("./config")
CallbackEmitter = require("./callback_emitter")
IDMapping = require("./id_mapping")
Logger = require("./logger")

# The database of hooks.
# Used always from memory, but saved to redis for persistence.
#
# Format:
#   { id: Hook }
# Format on redis:
#   * a SET "...:hooks" with all ids
#   * a HASH "...:hook:<id>" for each hook with some of its attributes
db = {}
nextID = 1

# The representation of a hook and its properties. Stored in memory and persisted
# to redis.
# Hooks can be global, receiving callback calls for events from all meetings on the
# server, or for a specific meeting. If an `externalMeetingID` is set in the hook,
# it will only receive calls related to this meeting, otherwise it will be global.
# Events are kept in a queue to be sent in the order they are received.
# TODO: The queue should be cleared at some point. The hook is destroyed if too many
#   callback attempts fail, after ~5min. So the queue is already protected in this case.
#   But if the requests are going by but taking too long, the queue might be increasing
#   faster than the callbacks are made.
module.exports = class Hook

  constructor: ->
    @id = null
    @callbackURL = null
    @externalMeetingID = null
    @queue = []
    @emitter = null
    @redisClient = redis.createClient()

  save: (callback) ->
    @redisClient.hmset config.redis.keys.hook(@id), @toRedis(), (error, reply) =>
      Logger.error "Hook: error saving hook to redis!", error, reply if error?
      @redisClient.sadd config.redis.keys.hooks, @id, (error, reply) =>
        Logger.error "Hook: error saving hookID to the list of hooks!", error, reply if error?

        db[@id] = this
        callback?(error, db[@id])

  destroy: (callback) ->
    @redisClient.srem config.redis.keys.hooks, @id, (error, reply) =>
      Logger.error "Hook: error removing hookID from the list of hooks!", error, reply if error?
      @redisClient.del config.redis.keys.hook(@id), (error) =>
        Logger.error "Hook: error removing hook from redis!", error if error?

        if db[@id]
          delete db[@id]
          callback?(error, true)
        else
          callback?(error, false)

  # Is this a global hook?
  isGlobal: ->
    not @externalMeetingID?

  # The meeting from which this hook should receive events.
  targetMeetingID: ->
    @externalMeetingID

  # Puts a new message in the queue. Will also trigger a processing in the queue so this
  # message might be processed instantly.
  enqueue: (message) ->
    Logger.info "Hook: enqueueing message", JSON.stringify(message)
    @queue.push message
    @_processQueue()

  toRedis: ->
    r =
      "hookID": @id,
      "callbackURL": @callbackURL
    r.externalMeetingID = @externalMeetingID if @externalMeetingID?
    r

  fromRedis: (redisData) ->
    @id = parseInt(redisData.hookID)
    @callbackURL = redisData.callbackURL
    if redisData.externalMeetingID?
      @externalMeetingID = redisData.externalMeetingID
    else
      @externalMeetingID = null

  # Gets the first message in the queue and start an emitter to send it. Will only do it
  # if there is no emitter running already and if there is a message in the queue.
  _processQueue: ->
    message = @queue[0]
    return if not message? or @emitter?

    @emitter = new CallbackEmitter(@callbackURL, message)
    @emitter.start()

    @emitter.on "success", =>
      delete @emitter
      @queue.shift() # pop the first message just sent
      @_processQueue() # go to the next message

    # gave up trying to perform the callback, remove the hook forever
    @emitter.on "stopped", (error) =>
      Logger.warn "Hook: too many failed attempts to perform a callback call, removing the hook for", @callbackURL
      @destroy()

  @addSubscription = (callbackURL, meetingID=null, callback) ->
    hook = Hook.findByCallbackURLSync(callbackURL)
    if hook?
      callback?(new Error("There is already a subscription for this callback URL"), hook)
    else
      msg = "Hook: adding a hook with callback URL [#{callbackURL}]"
      msg += " for the meeting [#{meetingID}]" if meetingID?
      Logger.info msg

      hook = new Hook()
      hook.id = nextID++
      hook.callbackURL = callbackURL
      hook.externalMeetingID = meetingID
      hook.save (error, hook) -> callback?(error, hook)

  @removeSubscription = (hookID, callback) ->
    hook = Hook.getSync(hookID)
    if hook?
      msg = "Hook: removing the hook with callback URL [#{hook.callbackURL}]"
      msg += " for the meeting [#{hook.externalMeetingID}]" if hook.externalMeetingID?
      Logger.info msg

      hook.destroy (error, removed) -> callback?(error, removed)
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

  @findByExternalMeetingIDSync = (externalMeetingID) ->
    hooks = Hook.allSync()
    _.filter(hooks, (hook) ->
      (externalMeetingID? and externalMeetingID is hook.externalMeetingID)
    )

  @allGlobalSync = ->
    hooks = Hook.allSync()
    _.filter(hooks, (hook) -> hook.isGlobal())

  @allSync = ->
    arr = Object.keys(db).reduce((arr, id) ->
      arr.push db[id]
      arr
    , [])
    arr

  @clearSync = ->
    for id of db
      delete db[id]
    db = {}

  @findByCallbackURLSync = (callbackURL) ->
    for id of db
      if db[id].callbackURL is callbackURL
        return db[id]

  @initialize = (callback) ->
    Hook.resync(callback)

  # Gets all hooks from redis to populate the local database.
  # Calls `callback()` when done.
  @resync = (callback) ->
    client = redis.createClient()
    tasks = []

    client.smembers config.redis.keys.hooks, (error, hooks) =>
      Logger.error "Hook: error getting list of hooks from redis", error if error?

      hooks.forEach (id) =>
        tasks.push (done) =>
          client.hgetall config.redis.keys.hook(id), (error, hookData) ->
            Logger.error "Hook: error getting information for a hook from redis", error if error?

            if hookData?
              hook = new Hook()
              hook.fromRedis(hookData)
              hook.save (error, hook) ->
                nextID = hook.id + 1 if hook.id >= nextID
                done(null, hook)
            else
              done(null, null)

      async.series tasks, (errors, result) ->
        hooks = _.map(Hook.allSync(), (hook) -> "[#{hook.id}] #{hook.callbackURL}")
        Logger.info "Hook: finished resync, hooks registered:", hooks
        callback?()
