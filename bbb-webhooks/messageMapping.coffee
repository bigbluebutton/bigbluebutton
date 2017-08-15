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
    if messageObj.header.name in @meetingEvents
      @meetingTemplate(messageObj)
    else if messageObj.header.name in @userEvents
      @userTemplate(messageObj)
    else if messageObj.header.name in @chatEvents
      @chatTemplate(messageObj)

  # Map internal to external message for meeting information
  meetingTemplate: (messageObj) ->
    @mappedObject.data = {}
    @mappedObject.data.type = "event"
    @mappedObject.data.id = @mapInternalMessage(messageObj.header.name)
    @mappedObject.data.attributes = {}
    @mappedObject.data.attributes.meeting = {}
    @mappedObject.data.attributes.meeting["external-meeting-id"] = messageObj.payload.external_meeting_id
    @mappedObject.data.attributes.meeting["internal-meeting-id"] = messageObj.payload.meeting_id
    @mappedObject.data.event = {}
    @mappedObject.data.event.ts = messageObj.header.current_time
    if messageObj.header.name is "meeting_created_message"
      @mappedObject.data.attributes.name = messageObj.payload.name
      @mappedObject.data.attributes["is-breakout"] = messageObj.payload.is_breakout
      @mappedObject.data.attributes.duration = messageObj.payload.duration
      @mappedObject.data.attributes["create-time"] = messageObj.payload.create_time
      @mappedObject.data.attributes["create-date"] = messageObj.payload.create_date
      @mappedObject.data.attributes["moderator-pass"] = messageObj.payload.moderator_pass
      @mappedObject.data.attributes["viewer-pass"] = messageObj.payload.viewer_pass
      @mappedObject.data.attributes.recorded = messageObj.payload.recorded
      #@mappedObject.data.attributes.record = ?
      @mappedObject.data.attributes["voice-conf"] = messageObj.payload.voice_conf
      #@mappedObject.data.attributes.dial-number = ?
      @mappedObject.data.attributes["max-users"] = messageObj.payload.max_users
      @mappedObject.data.attributes.metadata = {}
      #@mappedObject.data.attributes.metadata. ?
    @mappedMessage = JSON.stringify(@mappedObject)
    Logger.info "MessageMapping: Mapped message:", @mappedMessage

  # Map internal to external message for user information
  userTemplate: (messageObj) ->
    @mappedObject.data = {}
    @mappedObject.data.type = "event"
    @mappedObject.data.id = @mapInternalMessage(messageObj.header.name)
    @mappedObject.data.attributes = {}
    @mappedObject.data.attributes.meeting = {}
    #@mappedObject.data.attributes.meeting["external-meeting-id"] = messageObj.payload.  ?
    @mappedObject.data.attributes.meeting["internal-meeting-id"] = messageObj.payload.meeting_id
    @mappedObject.data.event = {}
    @mappedObject.data.event.ts = messageObj.header.current_time
    @mappedObject.data.attributes.user = {}
    @mappedObject.data.attributes.user["internal-user-id"] = messageObj.payload.user.userid
    @mappedObject.data.attributes.user["external-user-id"] = messageObj.payload.user.extern_userid
    if messageObj.header.name is "user_joined_message"
      @mappedObject.data.attributes.user.name = messageObj.payload.user.name
      @mappedObject.data.attributes.user.role = messageObj.payload.user.role
      @mappedObject.data.attributes.user.presenter = messageObj.payload.user.presenter
      #@mappedObject.data.attributes.user["sharing-mic"] = messageObj.payload.user. ?
      @mappedObject.data.attributes.user["sharing-video"] = messageObj.payload.user.has_stream
      @mappedObject.data.attributes.user["listening-only"] = messageObj.payload.user.listenOnly
    @mappedMessage = JSON.stringify(@mappedObject)
    Logger.info "MessageMapping: Mapped message:", @mappedMessage

  # Map internal to external message for chat information
  chatTemplate: (messageObj) ->
    @mappedObject.data = {}
    @mappedObject.data.type = "event"
    @mappedObject.data.id = @mapInternalMessage(messageObj.header.name)
    @mappedObject.data.attributes = {}
    @mappedObject.data.attributes.meeting = {}
    #@mappedObject.data.attributes.meeting["external-meeting-id"] = messageObj.payload.  ?
    @mappedObject.data.attributes.meeting["internal-meeting-id"] = messageObj.payload.meeting_id
    @mappedObject.data.event = {}
    @mappedObject.data.event.ts = messageObj.header.current_time
    @mappedObject.data.attributes["chat-message"] = {}
    @mappedObject.data.attributes["chat-message"].message = messageObj.payload.message.message
    @mappedObject.data.attributes["chat-message"].sender = {}
    @mappedObject.data.attributes["chat-message"].sender["internal-user-id"] = messageObj.payload.message.fromUserID
    @mappedObject.data.attributes["chat-message"].sender["external-user-id"] = messageObj.payload.message.fromUsername
    @mappedObject.data.attributes["chat-message"].sender["timezone-offset"] = messageObj.payload.message.fromTimeZoneOffset
    @mappedObject.data.attributes["chat-message"].sender.time = messageObj.payload.message.fromTime
    if messageObj.header.name.indexOf("private") != -1
      @mappedObject.data.attributes["chat-message"].receiver = {}
      @mappedObject.data.attributes["chat-message"].receiver["internal-user-id"] = messageObj.payload.message.toUserID
      @mappedObject.data.attributes["chat-message"].sender["external-user-id"] = messageObj.payload.message.toUsername
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
