const config = require("./config.js");
const Logger = require("./logger.js");
const IDMapping = require("./id_mapping.js");
const UserMapping = require("./userMapping.js");
module.exports = class MessageMapping {

  constructor() {
    this.mappedObject = {};
    this.mappedMessage = {};
    this.meetingEvents = ["MeetingCreatedEvtMsg","MeetingDestroyedEvtMsg"];
    this.userEvents = ["UserJoinedMeetingEvtMsg","UserLeftMeetingEvtMsg","UserJoinedVoiceConfToClientEvtMsg","UserLeftVoiceConfToClientEvtMsg","PresenterAssignedEvtMsg", "PresenterUnassignedEvtMsg"];
    this.chatEvents = ["SendPublicMessageEvtMsg","SendPrivateMessageEvtMsg"];
    this.rapEvents = ["archive_started","archive_ended","sanity_started","sanity_ended","post_archive_started","post_archive_ended","process_started","process_ended","post_process_started","post_process_ended","publish_started","publish_ended","post_publish_started","post_publish_ended"];
  }

  // Map internal message based on it's type
  mapMessage(messageObj) {
    if (this.mappedEvent(messageObj,this.meetingEvents)) {
      this.meetingTemplate(messageObj);
    } else if (this.mappedEvent(messageObj,this.userEvents)) {
      this.userTemplate(messageObj);
    } else if (this.mappedEvent(messageObj,this.chatEvents)) {
      this.chatTemplate(messageObj);
    } else if (this.mappedEvent(messageObj,this.rapEvents)) {
      this.rapTemplate(messageObj);
    }
  }

  mappedEvent(messageObj,events) {
    return events.some( event => {
      if ((messageObj.header != null ? messageObj.header.name : undefined) === event) {
        return true;
      }
      if ((messageObj.envelope != null ? messageObj.envelope.name : undefined) === event) {
        return true;
      }
      return false;
    });
  }

  // Map internal to external message for meeting information
  meetingTemplate(messageObj) {
    const props = messageObj.core.body.props;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.core.body.meetingId,
          "external-meeting-id": IDMapping.getExternalMeetingID(messageObj.core.body.meetingId)
        }
      },
      "event":{
        "ts": Date.now()
      }
    };
    if (messageObj.envelope.name === "MeetingCreatedEvtMsg") {
      this.mappedObject.data.attributes = {
        "meeting":{
          "internal-meeting-id": props.meetingProp.intId,
          "external-meeting-id": props.meetingProp.extId,
          "name": props.meetingProp.name,
          "is-breakout": props.meetingProp.isBreakout,
          "duration": props.durationProps.duration,
          "create-time": props.durationProps.createdTime,
          "create-date": props.durationProps.createdDate,
          "moderator-pass": props.password.moderatorPass,
          "viewer-pass": props.password.viewerPass,
          "record": props.recordProp.record,
          "voice-conf": props.voiceProp.voiceConf,
          "dial-number": props.voiceProp.dialNumber,
          "max-users": props.usersProp.maxUsers,
          "metadata": props.metadataProp.metadata
        }
      };
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  // Map internal to external message for user information
  userTemplate(messageObj) {
    const msgBody = messageObj.core.body;
    const msgHeader = messageObj.core.header;
    const extId = UserMapping.getExternalUserID(msgHeader.userId) ? UserMapping.getExternalUserID(msgHeader.userId) : msgBody.extId;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.envelope.routing.meetingId,
          "external-meeting-id": IDMapping.getExternalMeetingID(messageObj.envelope.routing.meetingId)
        },
        "user":{
          "internal-user-id": msgHeader.userId,
          "external-user-id": extId ? extId : "",
          "sharing-mic": msgBody.muted,
          "name": msgBody.name,
          "role": msgBody.role,
          "presenter": msgBody.presenter,
          "stream": msgBody.stream,
          "listening-only": msgBody.listenOnly
        }
      },
      "event":{
        "ts": Date.now()
      }
    };
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  // Map internal to external message for chat information
  chatTemplate(messageObj) {
    const message = messageObj.core.body.message;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.envelope.routing.meetingId,
          "external-meeting-id": IDMapping.getExternalMeetingID(messageObj.envelope.routing.meetingId)
        },
        "chat-message":{
          "message": message.message,
          "sender":{
            "internal-user-id": message.fromUserId,
            "external-user-id": message.fromUsername,
            "timezone-offset": message.fromTimezoneOffset,
            "time": message.fromTime
          }
        }
      },
      "event":{
        "ts": Date.now()
      }
    };
    if (messageObj.envelope.name.indexOf("Private") !== -1) {
      this.mappedObject.data.attributes["chat-message"].receiver = {
        "internal-user-id": message.toUserId,
        "external-user-id": message.toUsername
      };
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  rapTemplate(messageObj) {
    data = messageObj.payload
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj.header.name),
      "attributes": {
        "meeting": {
          "internal-meeting-id": data.meeting_id,
          "external-meeting-id": IDMapping.getExternalMeetingID(data.meeting_id)
        },
        "recording": {
          "name": data.metadata.meetingName,
          "isBreakout": data.metadata.isBreakout,
          "startTime": data.startTime,
          "endTime": data.endTime,
          "size": data.playback.size,
          "rawSize": data.rawSize,
          "metadata": data.metadata,
          "playback": data.playback,
          "download": data.download
        }
      },
      "event": {
        "ts": messageObj.header.current_time
      }
    };
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }


  mapInternalMessage(message) {
    if (message.envelope) {
      message = message.envelope.name
    }
    else if (message.header) {
      message = message.header.name
    }
    const mappedMsg = (() => { switch (message) {
      case "MeetingCreatedEvtMsg": return "meeting-created";
      case "MeetingDestroyedEvtMsg": return "meeting-ended";
      case "UserJoinedMeetingEvtMsg": return "user-joined";
      case "UserLeftMeetingEvtMsg": return "user-left";
      case "UserJoinedVoiceConfToClientEvtMsg": return "user-audio-voice-enabled";
      case "UserLeftVoiceConfToClientEvtMsg": return "user-audio-voice-disabled";
      case "UserBroadcastCamStartedEvtMsg": return "user-cam-broadcast-start";
      case "UserBroadcastCamStoppedEvtMsg": return "user-cam-broadcast-end";
      case "PresenterAssignedEvtMsg": return "user-presenter-assigned";
      case "PresenterUnassignedEvtMsg": return "user-presenter-unassigned"
      case "SendPublicMessageEvtMsg": return "chat-public-message-sent";
      case "SendPrivateMessageEvtMsg": return "chat-private-message-sent";
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
};
