const _ = require("lodash");
const async = require("async");
const redis = require("redis");
const request = require("request");
const config = require("./config.js");
const Hook = require("./hook.js");
const IDMapping = require("./id_mapping.js");
const Logger = require("./logger.js");
const MessageMapping = require("./messageMapping.js");

// Web hooks will listen for events on redis coming from BigBlueButton and
// perform HTTP calls with them to all registered hooks.
module.exports = class WebHooks {

  constructor() {
    this.subscriberEvents = config.redis.pubSubClient;
  }

  start() {
    this._subscribeToEvents();
  }

  // Subscribe to the events on pubsub that might need to be sent in callback calls.
  _subscribeToEvents() {
    this.subscriberEvents.on("psubscribe", (channel, count) => Logger.info(`[WebHooks] subscribed to:${channel}`));

    this.subscriberEvents.on("pmessage", (pattern, channel, message) => {

      let raw;
      const processMessage = () => {
        Logger.info(`[WebHooks] processing message on [${channel}]:`, JSON.stringify(message));
        this._processEvent(message, raw);
      };

      try {
        raw = JSON.parse(message);
        let messageMapped = new MessageMapping();
        messageMapped.mapMessage(JSON.parse(message));
        message = messageMapped.mappedObject;
        if (!_.isEmpty(message) && !config.hooks.getRaw) {
          const id = message.data.attributes.meeting["internal-meeting-id"];
          IDMapping.reportActivity(id);

          // First treat meeting events to add/remove ID mappings
          if ((message.data != null ? message.data.id : undefined) === "meeting-created") {
            Logger.info(`[WebHooks] got create message on meetings channel [${channel}]:`, message);
            IDMapping.addOrUpdateMapping(message.data.attributes.meeting["internal-meeting-id"], message.data.attributes.meeting["external-meeting-id"], (error, result) =>
              // has to be here, after the meeting was created, otherwise create calls won't generate
              // callback calls for meeting hooks
              processMessage()
            );

          // TODO: Temporarily commented because we still need the mapping for recording events,
          //   after the meeting ended.
          // else if message.header?.name is "meeting_destroyed_event"
          //   Logger.info "[WebHooks] got destroy message on meetings channel [#{channel}]", message
          //   IDMapping.removeMapping message.payload?.meeting_id, (error, result) ->
          //     processMessage()

          } else {
            processMessage();
          }
        } else {
          this._processRaw(raw);
        }
      } catch (e) {
        Logger.error("[WebHooks] error processing the message:", JSON.stringify(raw), ":", e);
      }
    });
    for (let k in config.hooks.channels) {
      const channel = config.hooks.channels[k];
      this.subscriberEvents.psubscribe(channel);
    }
  }

  // Send raw data to hooks that are not expecting mapped messages
  _processRaw(message) {
    let idFromMessage;
    let hooks = Hook.allGlobalSync();

    // Add hooks for the specific meeting that expect raw data
    if (message[config.webhooks.rawPath] != null) {
      // Get meetingId for a raw message that was previously mapped by another webhook application or if it's straight from redis (configurable)
      switch (config.webhooks.rawPath) {
        case "payload": idFromMessage = message[config.webhooks.rawPath][config.webhooks.meetingID]; break;
        case "data": idFromMessage = message[config.webhooks.rawPath].attributes.meeting[config.webhooks.meetingID]; break;
      }
    }
    if (idFromMessage != null) {
      const eMeetingID = IDMapping.getExternalMeetingID(idFromMessage);
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID));
      // Notify the hooks that expect raw data
      async.forEach(hooks, function(hook) {
        if (hook.getRaw) { Logger.info("[WebHooks] enqueueing a raw message in the hook:", hook.callbackURL); }
        if (hook.getRaw) { hook.enqueue(message); }
      });
    } // Put foreach inside the if to avoid pingpong events
  }

  // Processes an event received from redis. Will get all hook URLs that
  // should receive this event and start the process to perform the callback.
  _processEvent(message, raw) {
    // Get all global hooks
    let hooks = Hook.allGlobalSync();

    // filter the hooks that need to receive this event
    // add hooks that are registered for this specific meeting
    const idFromMessage = message.data != null ? message.data.attributes.meeting["internal-meeting-id"] : undefined;
    if (idFromMessage != null) {
      const eMeetingID = IDMapping.getExternalMeetingID(idFromMessage);
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID));
    }

    // Notify every hook asynchronously, if hook N fails, it won't block hook N+k from receiving its message
    async.forEach(hooks, function(hook) {
      if (!hook.getRaw) { Logger.info("[WebHooks] enqueueing a message in the hook:", hook.callbackURL); }
      if (!hook.getRaw) { hook.enqueue(message); }
    });

    const sendRaw = hooks.some(hook => { return hook.getRaw });
    if (sendRaw) {
      this._processRaw(raw);
    }
  }
};
