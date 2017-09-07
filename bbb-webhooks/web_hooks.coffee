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
          id = @_findMeetingId(message)
          IDMapping.reportActivity(id)

          # First treat meeting events to add/remove ID mappings
          if message.envelope?.name is "MeetingCreatedEvtMsg"
            Logger.info "WebHooks: got create message on meetings channel [#{channel}]", message
            meetingProp = message.core?.body?.props?.meetingProp
            if meetingProp
              IDMapping.addOrUpdateMapping meetingProp.intId, meetingProp.extId, (error, result) ->
                # has to be here, after the meeting was created, otherwise create calls won't generate
                # callback calls for meeting hooks
                processMessage()

          # TODO: Temporarily commented because we still need the mapping for recording events,
          #   after the meeting ended.
          # else if message.envelope?.name is "MeetingEndedEvtMessage"
          #   Logger.info "WebHooks: got destroy message on meetings channel [#{channel}]", message
          #   IDMapping.removeMapping @_findMeetingId(message), (error, result) ->
          #     processMessage()

          else
            processMessage()

      catch e
        Logger.error "WebHooks: error processing the message", message, ":", e

    # Subscribe to the neccesary channels.
    for k, channel of config.hooks.channels
      @subscriberEvents.psubscribe channel

  # Returns whether the message read from redis should generate a callback
  # call or not.
  _filterMessage: (channel, message) ->
    messageName = @_messageNameFromChannel(channel, message)
    for event in config.hooks.events
      if channel? and messageName? and
         event.channel.match(channel) and event.name.match(messageName)
          return true
    false  

  # BigBlueButton 2.0 changed where the message name is located, but it didn't
  # change for the Record and Playback events. Thus, we need to handle both.
  _messageNameFromChannel: (channel, message) ->
    if channel == 'bigbluebutton:from-rap'
      return message.header?.name
    message.envelope?.name

  # Find the meetingId in the message.
  # This is neccesary because the new message in BigBlueButton 2.0 have 
  # their meetingId in different locations.
  _findMeetingId: (message) ->
    # Various 2.0 meetingId locations.
    return message.envelope.routing.meetingId if message.envelope?.routing?.meetingId?
    return message.header.body.meetingId if message.header?.body?.meetingId?
    return message.core.body.meetingId if message.core?.body?.meetingId?
    return message.core.body.props.meetingProp.intId if message.core?.body?.props?.meetingProp?.intId?
    # Record and Playback 1.1 meeting_id location.
    return message.payload.meeting_id if message.payload?.meeting_id?
    return undefined
    
  # Processes an event received from redis. Will get all hook URLs that
  # should receive this event and start the process to perform the callback.
  _processEvent: (message) ->
    hooks = Hook.allGlobalSync()

    # TODO: events that happen after the meeting ended will never trigger the hooks
    # below, since the mapping is removed when the meeting ends

    # filter the hooks that need to receive this event
    # only global hooks or hooks for this specific meeting
    
    # All the messages have the meetingId in different locations now.
    # Depending on the event, it could appear within header, core or envelope.
    # It always appears in atleast one, so we just need to search for it.
    idFromMessage = @_findMeetingId(message)
    if idFromMessage?
      eMeetingID = IDMapping.getExternalMeetingID(idFromMessage)
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID))

    hooks.forEach (hook) ->
      Logger.info "WebHooks: enqueueing a message in the hook:", hook.callbackURL
      hook.enqueue message
