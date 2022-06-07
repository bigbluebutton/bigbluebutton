const Logger = require("./logger.js");
const IDMapping = require("./id_mapping.js");
const UserMapping = require("./userMapping.js");
module.exports = class MessageMapping {

  constructor() {
    this.mappedObject = {};
    this.mappedMessage = {};
    this.meetingEvents = ["MeetingCreatedEvtMsg","MeetingDestroyedEvtMsg", "ScreenshareRtmpBroadcastStartedEvtMsg", "ScreenshareRtmpBroadcastStoppedEvtMsg", "SetCurrentPresentationEvtMsg", "RecordingStatusChangedEvtMsg"];
    this.userEvents = ["UserJoinedMeetingEvtMsg","UserLeftMeetingEvtMsg","UserJoinedVoiceConfToClientEvtMsg","UserLeftVoiceConfToClientEvtMsg","PresenterAssignedEvtMsg", "PresenterUnassignedEvtMsg", "UserBroadcastCamStartedEvtMsg", "UserBroadcastCamStoppedEvtMsg", "UserEmojiChangedEvtMsg"];
    this.chatEvents = ["SendPublicMessageEvtMsg","SendPrivateMessageEvtMsg"];
    this.rapEvents = ["PublishedRecordingSysMsg","UnpublishedRecordingSysMsg","DeletedRecordingSysMsg"];
    this.compMeetingEvents = ["meeting_created_message","meeting_destroyed_event"];
    this.compUserEvents = ["user_joined_message","user_left_message","user_listening_only","user_joined_voice_message","user_left_voice_message","user_shared_webcam_message","user_unshared_webcam_message","user_status_changed_message"];
    this.compRapEvents = ["archive_started","archive_ended","sanity_started","sanity_ended","post_archive_started","post_archive_ended","process_started","process_ended","post_process_started","post_process_ended","publish_started","publish_ended","post_publish_started","post_publish_ended","published","unpublished","deleted"];
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
    } else if (this.mappedEvent(messageObj,this.compMeetingEvents)) {
      this.compMeetingTemplate(messageObj);
    } else if (this.mappedEvent(messageObj,this.compUserEvents)) {
      this.compUserTemplate(messageObj);
    } else if (this.mappedEvent(messageObj,this.compRapEvents)) {
      this.compRapTemplate(messageObj);
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
    const meetingId = messageObj.core.body.meetingId || messageObj.core.header.meetingId;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes":{
        "meeting":{
          "internal-meeting-id": meetingId,
          "external-meeting-id": IDMapping.getExternalMeetingID(meetingId)
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

  compMeetingTemplate(messageObj) {
    const props = messageObj.payload;
    const meetingId = props.meeting_id;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes":{
        "meeting":{
          "internal-meeting-id": meetingId,
          "external-meeting-id": IDMapping.getExternalMeetingID(meetingId)
        }
      },
      "event":{
        "ts": Date.now()
      }
    };
    if (messageObj.header.name === "meeting_created_message") {
      this.mappedObject.data.attributes = {
        "meeting":{
          "internal-meeting-id": meetingId,
          "external-meeting-id": props.external_meeting_id,
          "name": props.name,
          "is-breakout": props.is_breakout,
          "duration": props.duration,
          "create-time": props.create_time,
          "create-date": props.create_date,
          "moderator-pass": props.moderator_pass,
          "viewer-pass": props.viewer_pass,
          "record": props.recorded,
          "voice-conf": props.voice_conf,
          "dial-number": props.dial_number,
          "max-users": props.max_users,
          "metadata": props.metadata
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
    const extId = UserMapping.getExternalUserID(msgHeader.userId) || msgBody.extId || "";
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
          "external-user-id": extId,
          "name": msgBody.name,
          "role": msgBody.role,
          "presenter": msgBody.presenter,
          "stream": msgBody.stream
        }
      },
      "event":{
        "ts": Date.now()
      }
    };
    if (this.mappedObject.data["id"] === "user-audio-voice-enabled") {
      this.mappedObject.data["attributes"]["user"]["listening-only"] = msgBody.listenOnly;
      this.mappedObject.data["attributes"]["user"]["sharing-mic"] = ! msgBody.listenOnly;
    } else if (this.mappedObject.data["id"] === "user-audio-voice-disabled") {
      this.mappedObject.data["attributes"]["user"]["listening-only"] = false;
      this.mappedObject.data["attributes"]["user"]["sharing-mic"] = false;
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  // Map internal to external message for user information
  compUserTemplate(messageObj) {
    const msgBody = messageObj.payload;
    const msgHeader = messageObj.header;

    let user;
    if (msgHeader.name === "user_joined_message") {
      user = {
        "internal-user-id": msgBody.user.userid,
        "external-user-id": msgBody.user.extern_userid,
        "sharing-mic": msgBody.user.voiceUser.joined,
        "name": msgBody.user.name,
        "role": msgBody.user.role,
        "presenter": msgBody.user.presenter,
        "stream": msgBody.user.webcam_stream,
        "listening-only": msgBody.user.listenOnly
      }
    }
    else {
      user = UserMapping.getUser(msgBody.userid) || { "internal-user-id": msgBody.userid || msgBody.user.userid };
      if (msgHeader.name === "user_status_changed_message") {
        if (msgBody.status === "presenter") {
          user["presenter"] = msgBody.value;
        }
      }
      else if (msgHeader.name === "user_listening_only") {
        user["listening-only"] = msgBody.listen_only;
      }
      else if (msgHeader.name === "user_joined_voice_message" || msgHeader.name === "user_left_voice_message") {
        user["sharing-mic"] = msgBody.user.voiceUser.joined;
      }
      else if (msgHeader.name === "user_shared_webcam_message") {
        user["stream"].push(msgBody.stream);
      }
      else if (msgHeader.name === "user_unshared_webcam_message") {
        let streams = user["stream"];
        let index = streams.indexOf(msgBody.stream);
        if (index != -1) {
          streams.splice(index,1);
        }
        user["stream"] = streams;
      }
    }

    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes":{
        "meeting":{
          "internal-meeting-id": msgBody.meeting_id,
          "external-meeting-id": IDMapping.getExternalMeetingID(msgBody.meeting_id)
        },
        "user": user
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
    const data = messageObj.core.body;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes": {
        "meeting": {
          "internal-meeting-id": data.recordId,
          "external-meeting-id": IDMapping.getExternalMeetingID(data.recordId)
        }
      },
      "event": {
        "ts": Date.now()
      }
    };
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }

  compRapTemplate(messageObj) {
    const data = messageObj.payload;
    this.mappedObject.data = {
      "type": "event",
      "id": this.mapInternalMessage(messageObj),
      "attributes": {
        "meeting": {
          "internal-meeting-id": data.meeting_id,
          "external-meeting-id": data.external_meeting_id || IDMapping.getExternalMeetingID(data.meeting_id)
        }
      },
      "event": {
        "ts": messageObj.header.current_time
      }
    };

    if (this.mappedObject.data.id === "published" ||
        this.mappedObject.data.id === "unpublished" ||
        this.mappedObject.data.id === "deleted") {
      this.mappedObject.data.attributes["record-id"] = data.meeting_id;
      this.mappedObject.data.attributes["format"] = data.format;
    } else {
      this.mappedObject.data.attributes["record-id"] = data.record_id;
      this.mappedObject.data.attributes["success"] = data.success;
      this.mappedObject.data.attributes["step-time"] = data.step_time;
    }

    if (data.workflow) {
      this.mappedObject.data.attributes.workflow = data.workflow;
    }

    if (this.mappedObject.data.id === "rap-publish-ended") {
      this.mappedObject.data.attributes.recording = {
        "name": data.metadata.meetingName,
        "is-breakout": data.metadata.isBreakout,
        "start-time": data.startTime,
        "end-time": data.endTime,
        "size": data.playback.size,
        "raw-size": data.rawSize,
        "metadata": data.metadata,
        "playback": data.playback,
        "download": data.download
      }
    }
    this.mappedMessage = JSON.stringify(this.mappedObject);
    Logger.info("[MessageMapping] Mapped message:", this.mappedMessage);
  }


  mapInternalMessage(message) {
    let name;
    if (message.envelope) {
      name = message.envelope.name
    }
    else if (message.header) {
      name = message.header.name
    }
    const mappedMsg = (() => { switch (name) {
      case "MeetingCreatedEvtMsg": return "meeting-created";
      case "MeetingDestroyedEvtMsg": return "meeting-ended";
      case "RecordingStatusChangedEvtMsg": return "meeting-recording-changed";
      case "ScreenshareRtmpBroadcastStartedEvtMsg": return "meeting-screenshare-started";
      case "ScreenshareRtmpBroadcastStoppedEvtMsg": return "meeting-screenshare-stopped";
      case "SetCurrentPresentationEvtMsg": return "meeting-presentation-changed";
      case "UserJoinedMeetingEvtMsg": return "user-joined";
      case "UserLeftMeetingEvtMsg": return "user-left";
      case "UserJoinedVoiceConfToClientEvtMsg": return "user-audio-voice-enabled";
      case "UserLeftVoiceConfToClientEvtMsg": return "user-audio-voice-disabled";
      case "UserBroadcastCamStartedEvtMsg": return "user-cam-broadcast-start";
      case "UserBroadcastCamStoppedEvtMsg": return "user-cam-broadcast-end";
      case "PresenterAssignedEvtMsg": return "user-presenter-assigned";
      case "PresenterUnassignedEvtMsg": return "user-presenter-unassigned";
      case "UserEmojiChangedEvtMsg": return "user-emoji-changed";
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
      case "published": return "rap-published";
      case "unpublished": return "rap-unpublished";
      case "deleted": return "rap-deleted";
      case "PublishedRecordingSysMsg": return "rap-published";
      case "UnpublishedRecordingSysMsg": return "rap-unpublished";
      case "DeletedRecordingSysMsg": return "rap-deleted";
      case "post_publish_started": return "rap-post-publish-started";
      case "post_publish_ended": return "rap-post-publish-ended";
      case "meeting_created_message": return "meeting-created";
      case "meeting_destroyed_event": return "meeting-ended";
      case "user_joined_message": return "user-joined";
      case "user_left_message": return "user-left";
      case "user_listening_only": return (message.payload.listen_only ? "user-audio-listen-only-enabled" : "user-audio-listen-only-disabled");
      case "user_joined_voice_message": return "user-audio-voice-enabled";
      case "user_left_voice_message": return "user-audio-voice-disabled";
      case "user_shared_webcam_message": return "user-cam-broadcast-start";
      case "video_stream_unpublished": return "user-cam-broadcast-end";
      case "user_status_changed_message":
        if (message.payload.status === "presenter") {
          return (message.payload.value === "true" ? "user-presenter-assigned" : "user-presenter-unassigned" );
        }
    } })();
    return mappedMsg;
  }
};
