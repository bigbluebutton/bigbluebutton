package org.bigbluebutton.core.pubsub.senders

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.messaging.Util
import org.bigbluebutton.messages._

import spray.json.JsArray
import spray.json.JsObject
import spray.json.JsString

object MeetingMessageToJsonConverter {
  def meetingDestroyedToJson(msg: MeetingDestroyed): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.MEETING_DESTROYED_EVENT, None)
    Util.buildJson(header, payload)
  }

  def keepAliveMessageReplyToJson(msg: KeepAliveMessageReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.KEEP_ALIVE_ID, msg.aliveID)

    val header = Util.buildHeader(MessageNames.KEEP_ALIVE_REPLY, None)
    Util.buildJson(header, payload)
  }

  def meetingCreatedToJson(msg: MeetingCreated): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.EXTERNAL_MEETING_ID, msg.mProps.extId.value)
    payload.put(Constants.NAME, msg.mProps.name.value)
    payload.put(Constants.RECORDED, msg.mProps.recordingProp.recorded)
    payload.put(Constants.VOICE_CONF, msg.mProps.voiceConf.value)
    payload.put(Constants.DURATION, msg.mProps.duration)

    val header = Util.buildHeader(MessageNames.MEETING_CREATED, None)
    Util.buildJson(header, payload)
  }

  def meetingEndedToJson(msg: MeetingEnded): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)

    val header = Util.buildHeader(MessageNames.MEETING_ENDED, None)
    Util.buildJson(header, payload)
  }

  def voiceRecordingStartedToJson(msg: VoiceRecordingStarted): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.RECORDING_FILE, msg.recordingFile)
    payload.put(Constants.VOICE_CONF, msg.confNum)
    payload.put(Constants.TIMESTAMP, msg.timestamp)

    val header = Util.buildHeader(MessageNames.VOICE_RECORDING_STARTED, None)
    Util.buildJson(header, payload)
  }

  def voiceRecordingStoppedToJson(msg: VoiceRecordingStopped): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.RECORDING_FILE, msg.recordingFile)
    payload.put(Constants.VOICE_CONF, msg.confNum)
    payload.put(Constants.TIMESTAMP, msg.timestamp)

    val header = Util.buildHeader(MessageNames.VOICE_RECORDING_STOPPED, None)
    Util.buildJson(header, payload)
  }

  def recordingStatusChangedToJson(msg: RecordingStatusChanged): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.RECORDING_STATUS_CHANGED, None)
    Util.buildJson(header, payload)
  }

  def getRecordingStatusReplyToJson(msg: GetRecordingStatusReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.USER_ID, msg.userId.value)
    payload.put(Constants.RECORDING, msg.recording)

    val header = Util.buildHeader(MessageNames.GET_RECORDING_STATUS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def meetingHasEndedToJson(msg: MeetingHasEnded): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.USER_ID, msg.userId.value)

    val header = Util.buildHeader(MessageNames.MEETING_ENDED, None)
    Util.buildJson(header, payload)
  }

  def startRecordingToJson(msg: StartRecording): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)

    val header = Util.buildHeader(MessageNames.START_RECORDING, None)
    Util.buildJson(header, payload)
  }

  def stopRecordingToJson(msg: StopRecording): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put(Constants.MEETING_ID, msg.meetingId.value)
    payload.put(Constants.RECORDED, msg.recorded.value)
    payload.put(Constants.REQUESTER_ID, msg.requesterId.value)

    val header = Util.buildHeader(MessageNames.STOP_RECORDING, None)
    Util.buildJson(header, payload)
  }

  def getAllMeetingsReplyToJson(msg: GetAllMeetingsReply): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetings", msg.meetings)

    val header = Util.buildHeader(MessageNames.GET_ALL_MEETINGS_REPLY, None)
    Util.buildJson(header, payload)
  }

  def breakoutRoomsListOutMessageToJson(msg: BreakoutRoomsListOutMessage): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("rooms", msg.rooms.toArray)

    val header = Util.buildHeader(BreakoutRoomsList.NAME, None)
    Util.buildJson(header, payload)
  }

  def breakoutRoomStartedOutMessageToJson(msg: BreakoutRoomStartedOutMessage): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("breakoutId", msg.breakout.breakoutId)
    payload.put("name", msg.breakout.name)

    val header = Util.buildHeader(BreakoutRoomStarted.NAME, None)
    Util.buildJson(header, payload)
  }

  def breakoutRoomEndedOutMessageToJson(msg: BreakoutRoomEndedOutMessage): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("breakoutId", msg.breakoutId)

    val header = Util.buildHeader(BreakoutRoomClosed.NAME, None)
    Util.buildJson(header, payload)
  }

  def breakoutRoomJoinURLOutMessageToJson(msg: BreakoutRoomJoinURLOutMessage): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("breakoutId", msg.breakoutId)
    payload.put("userId", msg.userId)
    payload.put("joinURL", msg.joinURL)

    val header = Util.buildHeader(BreakoutRoomJoinURL.NAME, None)
    Util.buildJson(header, payload)
  }

  def updateBreakoutUsersOutMessageToJson(msg: UpdateBreakoutUsersOutMessage): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("breakoutId", msg.breakoutId)
    payload.put("recorded", msg.recorded)
    payload.put("numberOfUsers", msg.users.length)
    payload.put("users", msg.users.toArray)

    val header = Util.buildHeader(UpdateBreakoutUsers.NAME, None)
    Util.buildJson(header, payload)
  }

  def meetingTimeRemainingUpdateToJson(msg: MeetingTimeRemainingUpdate): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("recorded", msg.recorded)
    payload.put("timeRemaining", msg.timeRemaining)

    val header = Util.buildHeader(TimeRemainingUpdate.NAME, None)
    Util.buildJson(header, payload)
  }

  def breakoutRoomsTimeRemainingUpdateToJson(msg: BreakoutRoomsTimeRemainingUpdateOutMessage): String = {
    val payload = new java.util.HashMap[String, Any]()
    payload.put("meetingId", msg.meetingId)
    payload.put("recorded", msg.recorded)
    payload.put("timeRemaining", msg.timeRemaining)

    // TODO: breakoutRoomsTimeRemainingUpdateToJson
    //    val header = Util.buildHeader(BreakoutRoomsTimeRemainingUpdate.NAME, None)
    //    Util.buildJson(header, payload)
    "foo"
  }
}
