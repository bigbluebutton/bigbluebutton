_ = require("lodash")
async = require("async")
redis = require("redis")
request = require("request")

config = require("./config")
Hook = require("./hook")
IDMapping = require("./id_mapping")
Logger = require("./logger")

# Web hooks will listen for events on redis coming from BigBlueButton and
# perform HTTP calls with them to all registered hooks.
module.exports = class WebHooks

  constructor: ->
    @subscriberEvents = redis.createClient()

    # To map internal and external meeting IDs
    @subscriberMeetings = redis.createClient()

  start: ->
    @_subscribeToEvents()
    @_subscribeToMeetings()

  # Subscribe to the events on pubsub that might need to be sent in callback calls.
  _subscribeToEvents: ->
    @subscriberEvents.on "psubscribe", (channel, count) ->
      Logger.info "WebHooks: subscribed to " + channel

    @subscriberEvents.on "pmessage", (pattern, channel, message) =>
      try
        message = JSON.parse(message)
        if message?
          id = message.payload?.meeting_id
          IDMapping.reportActivity(id)

          if @_filterMessage(channel, message)
            Logger.info "WebHooks: processing message on [#{channel}]:", JSON.stringify(message)
            @_processEvent(message)

      catch e
        Logger.error "WebHooks: error processing the message", message, ":", e

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
    hooks = Hook.allGlobalSync()

    # filter the hooks that need to receive this event
    # only global hooks or hooks for this specific meeting
    idFromMessage = message.payload?.meeting_id
    if idFromMessage?
      eMeetingID = IDMapping.getExternalMeetingID(idFromMessage)
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID))

    hooks.forEach (hook) ->
      Logger.info "WebHooks: enqueueing a message in the hook:", hook.callbackURL
      hook.enqueue message

  # Subscribe to the meeting events on pubsub to keep track of the mapping
  # of meeting IDs.
  _subscribeToMeetings: ->
    @subscriberMeetings.on "subscribe", (channel, count) ->
      Logger.info "WebHooks: subscribed to meetings channel ", channel

    @subscriberMeetings.on "message", (channel, message) =>
      Logger.info "WebHooks: got message on meetings channel [#{channel}]", message
      try
        message = JSON.parse(message)
        if message.header?.name is "meeting_created_message"
          IDMapping.addOrUpdateMapping(message.payload?.meeting_id, message.payload?.external_meeting_id)
        else if message.header?.name is "meeting_destroyed_event"
          IDMapping.removeMapping(message.payload?.meeting_id)

      catch e
        Logger.error.log "WebHooks: error processing the message", JSON.stringify(message), ":", e

    @subscriberMeetings.subscribe config.hooks.meetingsChannel
