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
    @permanent = false
    @backupURL = []
    @getRaw = false

  save: (callback) ->
    @redisClient.hmset config.redis.keys.hook(@id), @toRedis(), (error, reply) =>
      Logger.error "[Hook] error saving hook to redis:", error, reply if error?
      @redisClient.sadd config.redis.keys.hooks, @id, (error, reply) =>
        Logger.error "[Hook] error saving hookID to the list of hooks:", error, reply if error?

        db[@id] = this
        callback?(error, db[@id])

  destroy: (callback) ->
    @redisClient.srem config.redis.keys.hooks, @id, (error, reply) =>
      Logger.error "[Hook] error removing hookID from the list of hooks:", error, reply if error?
      @redisClient.del config.redis.keys.hook(@id), (error) =>
        Logger.error "[Hook] error removing hook from redis:", error if error?

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
    @redisClient.llen config.redis.keys.events(@id), (error, reply) =>
      length = reply
      if length < config.hooks.queueSize
        Logger.info "[Hook] enqueueing message:", JSON.stringify(message)
        # Add message to redis queue
        @redisClient.rpush config.redis.keys.events(@id), JSON.stringify(message), (error,reply) =>
        Logger.error "[Hook] error pushing event to redis queue:", JSON.stringify(message), error if error?
        @queue.push JSON.stringify(message)
        @_processQueue(length + 1)
      else
        Logger.warn "[Hook] queue size exceed, event:", JSON.stringify(message)

  toRedis: ->
    r =
      "hookID": @id,
      "callbackURL": @callbackURL,
      "permanent": @permanent,
      "backupURL": @backupURL,
      "getRaw": @getRaw
    r.externalMeetingID = @externalMeetingID if @externalMeetingID?
    r

  fromRedis: (redisData) ->
    @id = parseInt(redisData.hookID)
    @callbackURL = redisData.callbackURL
    @permanent = redisData.permanent
    @backupURL = redisData.backupURL
    @getRaw = redisData.getRaw
    if redisData.externalMeetingID?
      @externalMeetingID = redisData.externalMeetingID
    else
      @externalMeetingID = null

  # Gets the first message in the queue and start an emitter to send it. Will only do it
  # if there is no emitter running already and if there is a message in the queue.
  _processQueue: (length) ->
    # Will try to send up to 10 messages together if they're enqueued
    lengthIn = if length > 10 then 10 else length
    num = lengthIn + 1
    # Concat messages
    message = @queue.slice(0,lengthIn)
    message = message.join(";")

    return if not message? or @emitter? or length <= 0
    # Add params so emitter will 'know' when a hook is permanent and have backupURLs
    @emitter = new CallbackEmitter(@callbackURL, message, @backupURL)
    @emitter.start(@permanent)

    @emitter.on "success", =>
      delete @emitter
      while num -= 1
        # Remove the sent message from redis
        @redisClient.lpop config.redis.keys.events(@id), (error, reply) =>
          Logger.error "[Hook] error removing event from redis queue:", error if error?
        @queue.shift() # pop the first message just sent
      @_processQueue(length - lengthIn) # go to the next message

    # gave up trying to perform the callback, remove the hook forever if the hook's not permanent (emmiter will validate that)
    @emitter.on "stopped", (error) =>
      Logger.warn "[Hook] too many failed attempts to perform a callback call, removing the hook for:", @callbackURL
      @destroy()

  @addSubscription = (callbackURL, meetingID=null, getRaw, callback) ->
    #Since we can pass a list of URLs to serve as backup for the permanent hook, we need to check that
    firstURL = if callbackURL instanceof Array then callbackURL[0] else callbackURL

    hook = Hook.findByCallbackURLSync(firstURL)
    if hook?
      callback?(new Error("There is already a subscription for this callback URL"), hook)
    else
      msg = "[Hook] adding a hook with callback URL: [#{firstURL}],"
      msg += " for the meeting: [#{meetingID}]" if meetingID?
      Logger.info msg

      hook = new Hook()
      hook.callbackURL = firstURL
      hook.externalMeetingID = meetingID
      hook.getRaw = getRaw
      hook.permanent = if firstURL in config.hooks.aggr then true else false
      if hook.permanent then hook.id = 1;nextID++ else hook.id = nextID++
      # Create backup URLs list
      backupURLs = if callbackURL instanceof Array then callbackURL else []
      backupURLs.push(firstURL); backupURLs.shift()
      hook.backupURL = backupURLs
      Logger.info "[Hook] Backup URLs:", hook.backupURL
      # Sync permanent queue
      if hook.permanent
        hook.redisClient.llen config.redis.keys.events(hook.id), (error, len) =>
          if len > 0
            length = len
            hook.redisClient.lrange config.redis.keys.events(hook.id), 0, len, (error, elements) =>
              elements.forEach (element) =>
                hook.queue.push element
              hook._processQueue(length) if hook.queue.length > 0
      hook.save (error, hook) -> callback?(error, hook)

  @removeSubscription = (hookID, callback) ->
    hook = Hook.getSync(hookID)
    if hook? and hook.permanent is "false" or hook.permanent is false
      msg = "[Hook] removing the hook with callback URL: [#{hook.callbackURL}],"
      msg += " for the meeting: [#{hook.externalMeetingID}]" if hook.externalMeetingID?
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
    # Remove previous permanent hook (always ID = 1)
    client.srem config.redis.keys.hooks, 1, (error, reply) =>
      Logger.error "[Hook] error removing previous permanent hook from list:", error if error?
      client.del config.redis.keys.hook(1), (error) =>
        Logger.error "[Hook] error removing previous permanent hook from redis:", error if error?

    tasks = []

    client.smembers config.redis.keys.hooks, (error, hooks) =>
      Logger.error "[Hook] error getting list of hooks from redis:", error if error?
      hooks.forEach (id) =>
        tasks.push (done) =>
          client.hgetall config.redis.keys.hook(id), (error, hookData) ->
            Logger.error "[Hook] error getting information for a hook from redis:", error if error?

            if hookData?
              hook = new Hook()
              hook.fromRedis(hookData)
              # sync events queue
              client.llen config.redis.keys.events(hook.id), (error, len) =>
                length = len
                client.lrange config.redis.keys.events(hook.id), 0, len, (error, elements) =>
                  elements.forEach (element) =>
                    hook.queue.push element
              # Persist hook to redis
              hook.save (error, hook) ->
                nextID = hook.id + 1 if hook.id >= nextID
                hook._processQueue(length) if hook.queue.length > 0
                done(null, hook)
            else
              done(null, null)

      async.series tasks, (errors, result) ->
        hooks = _.map(Hook.allSync(), (hook) -> "[#{hook.id}] #{hook.callbackURL}")
        Logger.info "[Hook] finished resync, hooks registered:", hooks
        callback?()
