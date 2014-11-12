_ = require("lodash")
redis = require("redis")

config = require("./config")

# The database of mappings. Format:
# { internalMeetingID: externalMeetingID }
db = {}

# A simple model to store mappings for meeting IDs.
module.exports = class MeetingIDMap

  @addMapping = (internalMeetingID, externalMeetingID) ->
    unless internalMeetingID in _.keys(db)
      db[internalMeetingID] = externalMeetingID
      console.log "MeetingIDMap: added meeting mapping to the list { #{internalMeetingID}: #{db[internalMeetingID]} }"
      MeetingIDMap.updateRedis()

  @removeMapping = (internalMeetingID) ->
    if internalMeetingID in _.keys(db)
      console.log "MeetingIDMap: removing meeting mapping from the list { #{internalMeetingID}: #{db[internalMeetingID]} }"
      delete db[internalMeetingID]
      db[internalMeetingID] = null
      MeetingIDMap.updateRedis()

  @getInternalMeetingID = (externalMeetingID) ->
    for internal, external of db
      if external is externalMeetingID
        return internal
    null

  @getExternalMeetingID = (internalMeetingID) ->
    db[internalMeetingID]

  @initialize = (callback) ->
    MeetingIDMap.resync(callback)

  # Gets all mappings from redis to populate the local database.
  # Calls `callback()` when done.
  @resync = (callback) ->
    client = redis.createClient()
    client.hgetall config.redis.keys.mappings, (error, mappings) =>
      MeetingIDMap.fromRedis(mappings)
      callback?(error, mappings)

  @fromRedis = (mappings) ->
    db = mappings

  @updateRedis = (callback) ->
    client = redis.createClient()
    client.hmset config.redis.keys.mappings, db, (error, reply) =>
      callback?(error)
