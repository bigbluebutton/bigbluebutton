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

  start: ->
    @_subscribeToEvents()

  # Subscribe to the events on pubsub that might need to be sent in callback calls.
  _subscribeToEvents: ->
    @subscriberEvents.on "psubscribe", (channel, count) ->
      Logger.info "WebHooks: subscribed to " + channel

    @subscriberEvents.on "pmessage", (pattern, channel, message) =>

      processMessage = =>
        if @_filterMessage(channel, message)
          Logger.info "WebHooks: processing message on [#{channel}]:", JSON.stringify(message)
          @_processEvent(message)

      try
        message = JSON.parse(message)
        if message?
          id = message.payload?.meeting_id
          IDMapping.reportActivity(id)

          # First treat meeting events to add/remove ID mappings
          if message.header?.name is "meeting_created_message"
            Logger.info "WebHooks: got create message on meetings channel [#{channel}]", message
            IDMapping.addOrUpdateMapping message.payload?.meeting_id, message.payload?.external_meeting_id, (error, result) ->
              # has to be here, after the meeting was created, otherwise create calls won't generate
              # callback calls for meeting hooks
              processMessage()

          # TODO: Temporarily commented because we still need the mapping for recording events,
          #   after the meeting ended.
          # else if message.header?.name is "meeting_destroyed_event"
          #   Logger.info "WebHooks: got destroy message on meetings channel [#{channel}]", message
          #   IDMapping.removeMapping message.payload?.meeting_id, (error, result) ->
          #     processMessage()

          else
            processMessage()

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

    # TODO: events that happen after the meeting ended will never trigger the hooks
    # below, since the mapping is removed when the meeting ends

    # filter the hooks that need to receive this event
    # only global hooks or hooks for this specific meeting
    idFromMessage = message.payload?.meeting_id
    if idFromMessage?
      eMeetingID = IDMapping.getExternalMeetingID(idFromMessage)
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID))

    hooks.forEach (hook) ->
      Logger.info "WebHooks: enqueueing a message in the hook:", hook.callbackURL
      hook.enqueue message
