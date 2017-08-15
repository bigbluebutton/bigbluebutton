config = require("./config")
Logger = require("./logger")

module.exports = class MessageMapping

  constructor: ->
    @mappedObject = {}
    @mappedMessage = {}
    @meetingEvents = ["meeting_created_message","meeting_destroyed_event"]
    @userEvents = ["meeting_destroyed_event","user_joined_message","user_left_message","user_listening_only","user_listening_only","user_joined_voice_message","user_left_voice_message"]
    @chatEvents = ["send_public_chat_message","send_private_chat_message"]

  # Map internal message based on it's type
  mapMessage: (messageObj) ->
    if messageObj.header?.name in @meetingEvents
      @meetingTemplate(messageObj)
    else if messageObj.header?.name in @userEvents
      @userTemplate(messageObj)
    else if messageObj.header?.name in @chatEvents
      @chatTemplate(messageObj)

  # Map internal to external message for meeting information
  meetingTemplate: (messageObj) ->
    @mappedObject.data = {
      "type": "event",
      "id": @mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id,
          "external-meeting-id": messageObj.payload.external_meeting_id
        }
      },
      "event":{
        "ts": messageObj.header.current_time
      }
    }
    if messageObj.header.name is "meeting_created_message"
      @mappedObject.data.attributes = {
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
        #"record": ?,
        "voice-conf": messageObj.payload.voice_conf,
        #"dial-number": ?,
        "max-users": messageObj.payload.max_users,
        "metadata": {}
      }
    @mappedMessage = JSON.stringify(@mappedObject)
    Logger.info "MessageMapping: Mapped message:", @mappedMessage

  # Map internal to external message for user information
  userTemplate: (messageObj) ->
    @mappedObject.data = {
      "type": "event",
      "id": @mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id
          #"external-meeting-id": messageObj.payload.?
        },
        "user":{
          "internal-user-id": messageObj.payload.user.userid,
          "external-user-id": messageObj.payload.user.extern_userid
        }
      },
      "event":{
        "ts": messageObj.header.current_time
      }
    }
    if messageObj.header.name is "user_joined_message"
      @mappedObject.data.attributes.user = {
        "internal-user-id": messageObj.payload.user.userid,
        "external-user-id": messageObj.payload.user.extern_userid,
        "name": messageObj.payload.user.name,
        "role": messageObj.payload.user.role,
        "presenter": messageObj.payload.user.presenter,
        #"sharing-mic"]: messageObj.payload.user. ?
        "sharing-video": messageObj.payload.user.has_stream,
        "listening-only": messageObj.payload.user.listenOnly
      }
    @mappedMessage = JSON.stringify(@mappedObject)
    Logger.info "MessageMapping: Mapped message:", @mappedMessage

  # Map internal to external message for chat information
  chatTemplate: (messageObj) ->
    @mappedObject.data = {
      "type": "event",
      "id": @mapInternalMessage(messageObj.header.name),
      "attributes":{
        "meeting":{
          "internal-meeting-id": messageObj.payload.meeting_id
          #{}"external-meeting-id": messageObj.payload.?
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
    }
    if messageObj.header.name.indexOf("private") != -1
      @mappedObject.data.attributes["chat-message"].receiver = {
        "internal-user-id": messageObj.payload.message.toUserID,
        "external-user-id": messageObj.payload.message.toUsername
      }
    @mappedMessage = JSON.stringify(@mappedObject)
    Logger.info "MessageMapping: Mapped message:", @mappedMessage

  mapInternalMessage: (message) ->
    mappedMsg = switch message
      when "meeting_created_message" then "meeting-created"
      when "meeting_destroyed_event" then "meeting-ended"
      when "user_joined_message" then "user-joined"
      when "user_left_message" then "user-left"
      when "user_listening_only" then "user-audio-listen-only-enabled"
      when "user_listening_only" then "user-audio-listen-only-disabled"
      when "user_joined_voice_message" then "user-audio-voice-enabled"
      when "user_left_voice_message" then "user-audio-voice-disabled"
      when "send_public_chat_message" then "chat-public-message-sent"
      when "send_private_chat_message" then "chat-private-message-sent"
    mappedMsg
