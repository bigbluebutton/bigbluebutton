_ = require("lodash")

# The database of mappings. Format:
# { internalMeetingID: externalMeetingID }
db = {}

# A simple model to store mappings for meeting IDs.
module.exports = class MeetingIDMap

  @addMapping = (internalMeetingID, externalMeetingID) ->
    unless internalMeetingID in _.keys(db)
      db[internalMeetingID] = externalMeetingID
      console.log "MeetingIDMap: added meeting mapping to the list { #{internalMeetingID}: #{db[internalMeetingID]} }"

  @removeMapping = (internalMeetingID) ->
    if internalMeetingID in _.keys(db)
      console.log "MeetingIDMap: removing meeting mapping from the list { #{internalMeetingID}: #{db[internalMeetingID]} }"
      delete db[internalMeetingID]
      db[internalMeetingID] = null

  @getInternalMeetingID = (externalMeetingID) ->
    for internal, external of db
      if external is externalMeetingID
        return internal
    null

  @getExternalMeetingID = (internalMeetingID) ->
    db[internalMeetingID]
