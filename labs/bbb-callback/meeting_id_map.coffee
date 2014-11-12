_ = require("lodash")
redis = require("redis")

config = require("./config")

# The database of mappings. Uses the externalID as key because it changes less than
# the internal ID (e.g. the internalID can change for different meetings in the same
# room). Format:
#   { externalMeetingID: internalMeetingID }
db = {}

# A simple model to store mappings for meeting IDs.
module.exports = class MeetingIDMap

  @addOrUpdateMapping = (internalMeetingID, externalMeetingID) ->
    db[externalMeetingID] = internalMeetingID
    console.log "MeetingIDMap: added or changed meeting mapping to the list { #{externalMeetingID}: #{db[externalMeetingID]} }"
    MeetingIDMap.updateRedis()

  @removeMapping = (internalMeetingID) ->
    for external, internal of db
      if internalMeetingID is internal
        console.log "MeetingIDMap: removing meeting mapping from the list { #{external}: #{db[external]} }"
        delete db[external]
        db[external] = null
        MeetingIDMap.updateRedis()

  @getInternalMeetingID = (externalMeetingID) ->
    db[externalMeetingID]

  @getExternalMeetingID = (internalMeetingID) ->
    for external, internal of db
      if internal is internalMeetingID
        return external
    null

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
    if mappings?
      db = mappings
    else
      db = {}

  @updateRedis = (callback) ->
    client = redis.createClient()
    client.hmset config.redis.keys.mappings, db, (error, reply) =>
      callback?(error)
