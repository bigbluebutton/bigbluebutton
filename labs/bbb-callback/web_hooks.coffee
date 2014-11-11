_ = require("lodash")
async = require("async")
redis = require("redis")
request = require("request")

config = require("./config")
Hook = require("./hook")

# Web hooks will listen for events on redis coming from BigBlueButton and
# perform HTTP calls with them to all registered hooks.
module.exports = class WebHooks

  constructor: ->
    @subscriberEvents = redis.createClient()
    @client = redis.createClient()

    # TODO: TEMPORARY
    @subscriberMeetings = redis.createClient()
    @meetings = []
    @_subscribeToMeetings()

  start: ->
    @subscriberEvents.on "psubscribe", (channel, count) ->
      console.log "WebHooks: subscribed to " + channel

    @subscriberEvents.on "pmessage", (pattern, channel, message) =>
      try
        message = JSON.parse message
        if message? and @_filterMessage channel, message
          console.log "\nWebHooks: processing message [#{channel}]", message
          @_processEvent message

      catch e
        console.log "WebHooks: error processing the message", message, ":", e

    @subscriberEvents.psubscribe config.hooks.pchannel

  # Returns whether the message read from redis should generate a callback
  # call or not.
  _filterMessage: (channel, message) ->
    for event in config.hooks.events
      if channel? and message.header?.name? and
         event.channel.match(channel) and event.name.match(message.header?.name)
          return true
    false

  # Processes an event received from redis. Will get all hook URLs that
  # should receive this event and start the process to perform the callback.
  _processEvent: (message) ->
    @_getHookUrls (error, hookUrls) ->
      console.log "WebHooks: got hook urls:", hookUrls
      hookUrls.forEach (hook) ->
        hook.enqueue message

  # Gets all hook URLs on redis and
  # Calls `callback(errors, result)` when done. `result` is an array of `Hook` objects.
  # TODO: Once the hooks are stored in memory we won't need to get them from redis anymore
  _getHookUrls: (callback) ->
    tasks = []
    @meetings.forEach (meetingId) =>
      console.log "WebHooks: checking hooks for the meeting", meetingId
      tasks.push (done) =>

        @client.lrange "meeting:#{meetingId}:subscriptions", 0, -1, (error, subscriptions) =>
          # TODO: treat error
          @_getHookUrlsForSubscriptions meetingId, subscriptions, done

    async.series tasks, (errors, result) ->
      result = _.flatten result
      console.log "Hooks#_getHookUrls: returning", result
      callback?(errors, result)

  # Get the hook URLs for a list of subscriptions.
  _getHookUrlsForSubscriptions: (meetingId, subscriptions, callback) ->
    tasks = []
    subscriptions.forEach (sid, index) =>

      tasks.push (done) =>
        @client.hgetall "meeting:#{meetingId}:subscription:#{sid}", (error, redisData) ->
          # TODO: treat error
          console.log "WebHooks: creating hook url for", redisData
          hook = new Hook()
          hook.mapFromRedis redisData
          done null, hook

    async.series tasks, (errors, result) ->
      console.log "Hooks#_getHookUrlsForSubscriptions: returning", result
      callback?(errors, result)


  # TODO: TEMPORARY CODE BELOW
  # For now we have to check for all meetings created and store their internal
  # meeting ID so we can read from redis the hooks registered for these meetings.
  # In the future we might still need to get this events, but only to store the
  # meetings' externalID.

  _subscribeToMeetings: ->
    @subscriberMeetings.on "subscribe", (channel, count) ->
      console.log "WebHooks: subscribed to " + channel
    @subscriberMeetings.on "message", (channel, message) =>
      console.log "WebHooks: got message [#{channel}]", message
      try
        message = JSON.parse(message)
        if message.header?.name is "meeting_created_message"
          @_addMeeting(message.payload?.meeting_id)

        # TODO: if left here, will not emit a callback for the meeting_destroyed_event
        # else if message.header?.name is "meeting_destroyed_event"
        #   @_removeMeeting(message.payload?.meeting_id)

      catch e
        console.log "Application: error processing the message", message, ":", e

    @subscriberMeetings.subscribe "bigbluebutton:from-bbb-apps:meeting"

  _addMeeting: (meetingId) ->
    unless _.contains(@meetings, meetingId)
      console.log "WebHooks: adding meeting to the list", meetingId
      @meetings.push meetingId

  _removeMeeting: (meetingId) ->
    index = @meetings.indexOf(meetingId)
    if index > -1
      console.log "WebHooks: removing meeting from the list", meetingId
      @meetings.splice index, 1
