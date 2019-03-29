const _ = require("lodash");
const async = require("async");
const redis = require("redis");
const request = require("request");
const config = require("config");
const Hook = require("./hook.js");
const IDMapping = require("./id_mapping.js");
const Logger = require("./logger.js");
const MessageMapping = require("./messageMapping.js");
const UserMapping = require("./userMapping.js");

// Web hooks will listen for events on redis coming from BigBlueButton and
// perform HTTP calls with them to all registered hooks.
module.exports = class WebHooks {

  constructor() {
    this.subscriberEvents = Application.redisPubSubClient();
  }

  start(callback) {
    this._subscribeToEvents();
    typeof callback === 'function' ? callback(null,"w") : undefined;
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
        if (!_.isEmpty(message)) {
          const intId = message.data.attributes.meeting["internal-meeting-id"];
          IDMapping.reportActivity(intId);

          // First treat meeting events to add/remove ID mappings
          switch (message.data.id) {
            case "meeting-created":
              Logger.info(`[WebHooks] got create message on meetings channel [${channel}]:`, message);
              IDMapping.addOrUpdateMapping(intId, message.data.attributes.meeting["external-meeting-id"], (error, result) => {
              // has to be here, after the meeting was created, otherwise create calls won't generate
              // callback calls for meeting hooks
                processMessage();
              });
              break;
            case "user-joined":
              UserMapping.addOrUpdateMapping(message.data.attributes.user["internal-user-id"],message.data.attributes.user["external-user-id"], intId, message.data.attributes.user, () => {
                processMessage();
              });
              break;
            case "user-left":
              UserMapping.removeMapping(message.data.attributes.user["internal-user-id"], () => { processMessage(); });
              break;
            case "meeting-ended":
              UserMapping.removeMappingMeetingId(intId, () => { processMessage(); });
              break;
            default:
              processMessage();
          }
        }
      } catch (e) {
        Logger.error("[WebHooks] error processing the message:", JSON.stringify(raw), ":", e.message);
      }
    });

    config.get("hooks.channels").forEach((channel) => {
      this.subscriberEvents.psubscribe(channel);
    });

  }

  // Send raw data to hooks that are not expecting mapped messages
  _processRaw(message) {
    let idFromMessage;
    let hooks = Hook.allGlobalSync();

    // Add hooks for the specific meeting that expect raw data
    // Get meetingId for a raw message that was previously mapped by another webhook application or if it's straight from redis
    idFromMessage = this._findMeetingID(message);
    if (idFromMessage != null) {
      const eMeetingID = IDMapping.getExternalMeetingID(idFromMessage);
      hooks = hooks.concat(Hook.findByExternalMeetingIDSync(eMeetingID));
      // Notify the hooks that expect raw data
      async.forEach(hooks, (hook) => {
        if (hook.getRaw) {
          Logger.info("[WebHooks] enqueueing a raw message in the hook:", hook.callbackURL);
          hook.enqueue(message);
        }
      });
    } // Put foreach inside the if to avoid pingpong events
  }

  _findMeetingID(message) {
    if (message.data) {
      return message.data.attributes.meeting["internal-meeting-id"];
    }
    if (message.payload) {
      return message.payload.meeting_id;
    }
    if (message.envelope && message.envelope.routing && message.envelope.routing.meetingId) {
      return message.envelope.routing.meetingId;
    }
    if (message.header && message.header.body && message.header.body.meetingId) {
      return message.header.body.meetingId;
    }
    if (message.core && message.core.body) {
      return message.core.body.props ? message.core.body.props.meetingProp.intId : message.core.body.meetingId;
    }
    return undefined;
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
    async.forEach(hooks, (hook) => {
      if (!hook.getRaw) {
        Logger.info("[WebHooks] enqueueing a message in the hook:", hook.callbackURL);
        hook.enqueue(message);
      }
    });

    const sendRaw = hooks.some(hook => { return hook.getRaw });
    if (sendRaw && config.get("hooks.getRaw")) {
      this._processRaw(raw);
    }
  }
};
