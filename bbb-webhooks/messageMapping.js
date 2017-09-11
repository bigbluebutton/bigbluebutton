"use strict";
let MessageMapping;
const config = require("./config.js");
const Logger = require("./logger.js");
const IDMapping = require("./id_mapping.js");
module.exports = (MessageMapping = class MessageMapping {

  constructor() {
    this.mappedObject = {};
    this.mappedMessage = {};
    this.meetingEvents = ["meeting_created_message","meeting_destroyed_event"];
    this.userEvents = ["meeting_destroyed_event","user_joined_message","user_left_message","user_listening_only","user_joined_voice_message","user_left_voice_message"];
    this.chatEvents = ["send_public_chat_message","send_private_chat_message"];
    this.rapEvents = ["archive_started","archive_ended","sanity_started","sanity_ended","post_archive_started","post_archive_ended","process_started","process_ended","post_process_started","post_process_ended","publish_started","publish_ended","post_publish_started","post_publish_ended"];
  }

  // Map internal message based on it's type
  mapMessage(messageObj) {
    if (this.meetingEvents.some( event => {
      return (messageObj.header != null ? messageObj.header.name : undefined) === event
    })) {
      this.meetingTemplate(messageObj);
    } else if (this.userEvents.some( event => {
      return (messageObj.header != null ? messageObj.header.name : undefined) === event
    })) {
      this.userTemplate(messageObj);
    } else if (this.chatEvents.some( event => {
      return (messageObj.header != null ? messageObj.header.name : undefined) === event
    })) {
      this.chatTemplate(messageObj);
    } else if (this.rapEvents.some( event => {
      return (messageObj.header != null ? messageObj.header.name : undefined) === event
    })) {
      this.rapTemplate(messageObj);
    }
  }

  // Map internal to external message for meeting information
  meetingTemplate(messageObj) {
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id,
          "external-meeting-id": messageObj.payload.external_meeting_id
        }
      },
      "event":{
        "ts": messageObj.header.current_time
      }
    };
    if (messageObj.header.name === "meeting_created_message") {
      this.mappedObject.data.attributes = {
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id,
          "external-meeting-id": messageObj.payload.external_meeting_id
        },
        "name": messageObj.payload.name,
        "is-breakout": messageObj.payload.is_breakout,
        "duration": messageObj.payload.duration,
        "create-time": messageObj.payload.create_time,
        "create-date": messageObj.payload.create_date,
        "moderator-pass": messageObj.payload.moderator_pass,
        "viewer-pass": messageObj.payload.viewer_pass,
        "recorded": messageObj.payload.recorded,
        //"record": ?,
        "voice-conf": messageObj.payload.voice_conf,
        //"dial-number": ?,
        "max-users": messageObj.payload.max_users,
        "metadata": {}
      };
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  // Map internal to external message for user information
  userTemplate(messageObj) {
    // Specific verification for listen_only event
    messageObj.header.name += messageObj.payload.listen_only ? "_true" : "";
    const userid = (messageObj.payload.user != null) ? messageObj.payload.user.userid : messageObj.payload.userid;
    const extid = (messageObj.payload.user != null) ? messageObj.payload.user.extern_userid : "";
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id,
          "external-meeting-id": IDMapping.getExternalMeetingID(messageObj.payload.meeting_id)
        },
        "user":{
          "internal-user-id": userid,
          "external-user-id": extid
        }
      },
      "event":{
        "ts": messageObj.header.current_time
      }
    };
    if (messageObj.header.name === "user_joined_message") {
      this.mappedObject.data.attributes.user = {
        "internal-user-id": messageObj.payload.user.userid,
        "external-user-id": messageObj.payload.user.extern_userid,
        "name": messageObj.payload.user.name,
        "role": messageObj.payload.user.role,
        "presenter": messageObj.payload.user.presenter,
        "sharing-mic": messageObj.payload.user.voiceUser.joined,
        "sharing-video": messageObj.payload.user.has_stream,
        "listening-only": messageObj.payload.user.listenOnly
      };
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  // Map internal to external message for chat information
  chatTemplate(messageObj) {
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id,
          "external-meeting-id": IDMapping.getExternalMeetingID(messageObj.payload.meeting_id)
        },
        "chat-message":{
          "message": messageObj.payload.message.message,
          "sender":{
            "internal-user-id": messageObj.payload.message.fromUserID,
            "external-user-id": messageObj.payload.message.fromUsername,
            "timezone-offset": messageObj.payload.message.fromTimeZoneOffset,
            "time": messageObj.payload.message.fromTime
          }
        }
      },
      "event":{
        "ts": messageObj.header.current_time
      }
    };
    if (messageObj.header.name.indexOf("private") !== -1) {
      this.mappedObject.data.attributes["chat-message"].receiver = {
        "internal-user-id": messageObj.payload.message.toUserID,
        "external-user-id": messageObj.payload.message.toUsername
      };
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  rapTemplate(messageObj) {
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id,
          "external-meeting-id": IDMapping.getExternalMeetingID(messageObj.payload.meeting_id)
        }
      },
      "event":{
        "ts": messageObj.header.current_time
      }
    };
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }


  mapInternalMessage(message) {
    const mappedMsg = (() => { switch (message) {
      case "meeting_created_message": return "meeting-created";
      case "meeting_destroyed_event": return "meeting-ended";
      case "user_joined_message": return "user-joined";
      case "user_left_message": return "user-left";
      case "user_listening_only_true": return "user-audio-listen-only-enabled";
      case "user_listening_only": return "user-audio-listen-only-disabled";
      case "user_joined_voice_message": return "user-audio-voice-enabled";
      case "user_left_voice_message": return "user-audio-voice-disabled";
      case "send_public_chat_message": return "chat-public-message-sent";
      case "send_private_chat_message": return "chat-private-message-sent";
      case "archive_started": return "rap-archive-started";
      case "archive_ended": return "rap-archive-ended";
      case "sanity_started": return "rap-sanity-started";
      case "sanity_ended": return "rap-sanity-ended";
      case "post_archive_started": return "rap-post-archive-started";
      case "post_archive_ended": return "rap-post-archive-ended";
      case "process_started": return "rap-process-started";
      case "process_ended": return "rap-process-ended";
      case "post_process_started": return "rap-post-process-started";
      case "post_process_ended": return "rap-post-process-ended";
      case "publish_started": return "rap-publish-started";
      case "publish_ended": return "rap-publish-ended";
      case "post_publish_started": return "rap-post-publish-started";
      case "post_publish_ended": return "rap-post-publish-ended";
    } })();
    return mappedMsg;
  }
});
