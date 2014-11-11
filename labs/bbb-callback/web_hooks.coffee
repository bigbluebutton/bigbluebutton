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

    # To map internal and external meeting IDs
    @meetingMappings = {}
    @subscriberMeetings = redis.createClient()

  start: ->
    @_subscribeToEvents()
    # @_subscribeToMeetings()

  # Subscribe to the events on pubsub that might need to be sent in callback calls.
  _subscribeToEvents: ->
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
    hooks = Hook.allSync()
    hooks.forEach (hook) ->
      console.log "WebHooks: enqueuing a message in the hook:", hook.callbackURL
      hook.enqueue message

  # TODO: enable this once we have the external meeting ID on redis
  # # Subscribe to the meeting events on pubsub to keep track of the mapping
  # # of meeting IDs.
  # _subscribeToMeetings: ->
  #   @subscriberMeetings.on "subscribe", (channel, count) ->
  #     console.log "WebHooks: subscribed to meetings channel ", channel

  #   @subscriberMeetings.on "message", (channel, message) =>
  #     console.log "WebHooks: got message on meetings channel [#{channel}]", message
  #     try
  #       message = JSON.parse(message)
  #       if message.header?.name is "meeting_created_message"
  #         @_addMeetingMapping(message.payload?.meeting_id, message.payload?.external_meeting_id)
  #       else if message.header?.name is "meeting_destroyed_event"
  #         @_removeMeetingMapping(message.payload?.meeting_id)

  #     catch e
  #       console.log "WebHooks: error processing the message", message, ":", e

  #   @subscriberMeetings.subscribe config.hooks.meetingsChannel

  # _addMeetingMapping: (meetingID, externalMeetingID) ->
  #   unless @meetingMappíngs[meetingID]?
  #     @meetingMappings[meetingID] = externalMeetingID
  #     console.log "WebHooks: added meeting mapping to the list", meetingID, "=", @meetingMappings[meetingID]

  # _removeMeetingMapping: (meetingID) ->
  #   if @meetingMapping[meetingID]?
  #     console.log "WebHooks: removing meeting mapping from the list", meetingID, "=", @meetingMappings[meetingID]
  #     delete @meetingMappings[meetingID]

  # TODO: enable the methods below again when we persist hooks to redis again
  # # Gets all hooks from redis.
  # # Calls `callback(errors, result)` when done. `result` is an array of `Hook` objects.
  # _getHooksFromRedis: (callback) ->
  #   tasks = []
  #   @meetings.forEach (meetingID) =>
  #     console.log "WebHooks: checking hooks for the meeting", meetingID
  #     tasks.push (done) =>

  #       @client.lrange "meeting:#{meetingID}:subscriptions", 0, -1, (error, subscriptions) =>
  #         # TODO: treat error
  #         @_getHooksFromRedisForSubscriptions meetingID, subscriptions, done

  #   async.series tasks, (errors, result) ->
  #     result = _.flatten result
  #     console.log "Hooks#_getHooksFromRedis: returning", result
  #     callback?(errors, result)

  # # Get the hook URLs for a list of subscriptions.
  # _getHooksFromRedisForSubscriptions: (meetingID, subscriptions, callback) ->
  #   tasks = []
  #   subscriptions.forEach (sid, index) =>

  #     tasks.push (done) =>
  #       @client.hgetall "meeting:#{meetingID}:subscription:#{sid}", (error, redisData) ->
  #         # TODO: treat error
  #         console.log "WebHooks: creating hook url for", redisData
  #         hook = new Hook()
  #         hook.mapFromRedis redisData
  #         done null, hook

  #   async.series tasks, (errors, result) ->
  #     console.log "Hooks#_getHooksFromRedisForSubscriptions: returning", result
  #     callback?(errors, result)
