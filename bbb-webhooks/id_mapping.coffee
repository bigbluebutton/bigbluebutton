_ = require("lodash")
async = require("async")
redis = require("redis")

config = require("./config")
Logger = require("./logger")

# The database of mappings. Uses the internal ID as key because it is unique
# unlike the external ID.
# Used always from memory, but saved to redis for persistence.
#
# Format:
#   {
#      internalMeetingID: {
#       id: @id
#       externalMeetingID: @externalMeetingID
#       internalMeetingID: @internalMeetingID
#       lastActivity: @lastActivity
#     }
#   }
# Format on redis:
#   * a SET "...:mappings" with all ids (not meeting ids, the object id)
#   * a HASH "...:mapping:<id>" for each mapping with all its attributes
db = {}
nextID = 1

# A simple model to store mappings for meeting IDs.
module.exports = class IDMapping

  constructor: ->
    @id = null
    @externalMeetingID = null
    @internalMeetingID = null
    @lastActivity = null
    @redisClient = redis.createClient()

  save: (callback) ->
    @redisClient.hmset config.redis.keys.mapping(@id), @toRedis(), (error, reply) =>
      Logger.error "[IDMapping] error saving mapping to redis:", error, reply if error?
      @redisClient.sadd config.redis.keys.mappings, @id, (error, reply) =>
        Logger.error "[IDMapping] error saving mapping ID to the list of mappings:", error, reply if error?

        db[@internalMeetingID] = this
        callback?(error, db[@internalMeetingID])

  destroy: (callback) ->
    @redisClient.srem config.redis.keys.mappings, @id, (error, reply) =>
      Logger.error "[IDMapping] error removing mapping ID from the list of mappings:", error, reply if error?
      @redisClient.del config.redis.keys.mapping(@id), (error) =>
        Logger.error "[IDMapping] error removing mapping from redis:", error if error?

        if db[@internalMeetingID]
          delete db[@internalMeetingID]
          callback?(error, true)
        else
          callback?(error, false)

  toRedis: ->
    r =
      "id": @id,
      "internalMeetingID": @internalMeetingID
      "externalMeetingID": @externalMeetingID
      "lastActivity": @lastActivity
    r

  fromRedis: (redisData) ->
    @id = parseInt(redisData.id)
    @externalMeetingID = redisData.externalMeetingID
    @internalMeetingID = redisData.internalMeetingID
    @lastActivity = redisData.lastActivity

  print: ->
    JSON.stringify(@toRedis())

  @addOrUpdateMapping = (internalMeetingID, externalMeetingID, callback) ->
    mapping = new IDMapping()
    mapping.id = nextID++
    mapping.internalMeetingID = internalMeetingID
    mapping.externalMeetingID = externalMeetingID
    mapping.lastActivity = new Date().getTime()
    mapping.save (error, result) ->
      Logger.info "[IDMapping] added or changed meeting mapping to the list #{externalMeetingID}:", mapping.print()
      callback?(error, result)

  @removeMapping = (internalMeetingID, callback) ->
    for internal, mapping of db
      if mapping.internalMeetingID is internalMeetingID
        mapping.destroy (error, result) ->
          Logger.info "[IDMapping] removing meeting mapping from the list #{external}:", mapping.print()
          callback?(error, result)

  @getInternalMeetingID = (externalMeetingID) ->
    mapping = IDMapping.findByExternalMeetingID(externalMeetingID)
    mapping?.internalMeetingID

  @getExternalMeetingID = (internalMeetingID) ->
    db[internalMeetingID].externalMeetingID

  @findByExternalMeetingID = (externalMeetingID) ->
    if externalMeetingID?
      for internal, mapping of db
        if mapping.externalMeetingID is externalMeetingID
          return mapping
    null

  @allSync = ->
    arr = Object.keys(db).reduce((arr, id) ->
      arr.push db[id]
      arr
    , [])
    arr

  # Sets the last activity of the mapping for `internalMeetingID` to now.
  @reportActivity = (internalMeetingID) ->
    mapping = db[internalMeetingID]
    if mapping?
      mapping.lastActivity = new Date().getTime()
      mapping.save()

  # Checks all current mappings for their last activity and removes the ones that
  # are "expired", that had their last activity too long ago.
  @cleanup = ->
    now = new Date().getTime()
    all = IDMapping.allSync()
    toRemove = _.filter(all, (mapping) ->
      mapping.lastActivity < now - config.mappings.timeout
    )
    unless _.isEmpty(toRemove)
      Logger.info "[IDMapping] expiring the mappings:", _.map(toRemove, (map) -> map.print())
      toRemove.forEach (mapping) -> mapping.destroy()

  # Initializes global methods for this model.
  @initialize = (callback) ->
    IDMapping.resync(callback)
    IDMapping.cleanupInterval = setInterval(IDMapping.cleanup, config.mappings.cleanupInterval)

  # Gets all mappings from redis to populate the local database.
  # Calls `callback()` when done.
  @resync = (callback) ->
    client = redis.createClient()
    tasks = []

    client.smembers config.redis.keys.mappings, (error, mappings) =>
      Logger.error "[IDMapping] error getting list of mappings from redis:", error if error?

      mappings.forEach (id) =>
        tasks.push (done) =>
          client.hgetall config.redis.keys.mapping(id), (error, mappingData) ->
            Logger.error "[IDMapping] error getting information for a mapping from redis:", error if error?

            if mappingData?
              mapping = new IDMapping()
              mapping.fromRedis(mappingData)
              mapping.save (error, hook) ->
                nextID = mapping.id + 1 if mapping.id >= nextID
                done(null, mapping)
            else
              done(null, null)

      async.series tasks, (errors, result) ->
        mappings = _.map(IDMapping.allSync(), (m) -> m.print())
        Logger.info "[IDMapping] finished resync, mappings registered:", mappings
        callback?()
