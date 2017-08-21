_ = require("lodash")
async = require("async")
redis = require("redis")
request = require("request")

config = require("./config")
Hook = require("./hook")
IDMapping = require("./id_mapping")
Logger = require("./logger")
MessageMapping = require("./messageMapping")

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
      Logger.info "[WebHooks] subscribed to:" + channel

    @subscriberEvents.on "pmessage", (pattern, channel, message) =>

      processMessage = =>
        Logger.info "[WebHooks] processing message on [#{channel}]:", JSON.stringify(message)
        @_processEvent(message)

      try
        raw = JSON.parse(message)
        messageMapped = new MessageMapping()
        messageMapped.mapMessage(JSON.parse(message))
        message = messageMapped.mappedObject
        if not _.isEmpty(message)
          id = message.data.attributes.meeting["internal-meeting-id"]
          IDMapping.reportActivity(id)

          # First treat meeting events to add/remove ID mappings
          if message.data?.id is "meeting-created"
            Logger.info "[WebHooks] got create message on meetings channel [#{channel}]:", message
            IDMapping.addOrUpdateMapping message.data.attributes.meeting["internal-meeting-id"], message.data.attributes.meeting["external-meeting-id"], (error, result) ->
              # has to be here, after the meeting was created, otherwise create calls won't generate
              # callback calls for meeting hooks
              processMessage()

          # TODO: Temporarily commented because we still need the mapping for recording events,
          #   after the meeting ended.
          # else if message.header?.name is "meeting_destroyed_event"
          #   Logger.info "[WebHooks] got destroy message on meetings channel [#{channel}]", message
          #   IDMapping.removeMapping message.payload?.meeting_id, (error, result) ->
          #     processMessage()

          else
            processMessage()
        else
          @_processRaw(raw)
      catch e
        Logger.error "[WebHooks] error processing the message:", JSON.stringify(raw), ":", e

    @subscriberEvents.psubscribe config.hooks.pchannel

  # Send raw data to hooks that are not expecting mapped messages
  _processRaw: (message) ->
    hooks = Hook.allGlobalSync()

    # Add hooks for the specific meeting that expect raw data
    idFromMessage = message.payload?.meeting_id
    if idFromMessage?
      eMeetingID = IDMapping.getExternalMeetingID(idFromMessage)
      hook = Hook.findByExternalMeetingIDSync(eMeetingID)
      hooks = hooks.concat(hook) if hook.getRaw
    # Notify the hooks that expect raw data
    async.forEach hooks, (hook) ->
      Logger.info "[WebHooks] enqueueing a raw message in the hook:", hook.callbackURL if hook.getRaw
      hook.enqueue message if hook.getRaw

  # Processes an event received from redis. Will get all hook URLs that
  # should receive this event and start the process to perform the callback.
  _processEvent: (message) ->
    # Get all global hooks
    hooks = Hook.allGlobalSync()

    # filter the hooks that need to receive this event
    # add hooks that are registered for this specific meeting
    idFromMessage = message.data?.attributes.meeting["internal-meeting-id"]
    if idFromMessage?
      eMeetingID = IDMapping.getExternalMeetingID(idFromMessage)
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID))

    # Notify every hook asynchronously, if hook N fails, it won't block hook N+k from receiving its message
    async.forEach hooks, (hook) ->
      Logger.info "[WebHooks] enqueueing a message in the hook:", hook.callbackURL
      hook.enqueue message
