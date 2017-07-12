package org.bigbluebutton.freeswitch

import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common.messages.{ DeskShareRTMPBroadcastStartedEventMessage, DeskShareRTMPBroadcastStoppedEventMessage, DeskShareStartedEventMessage, DeskShareStoppedEventMessage }
import org.bigbluebutton.freeswitch.voice.IVoiceConferenceService
import org.bigbluebutton.endpoint.redis.RedisPublisher
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.common2.util.JsonUtil

class VoiceConferenceService(sender: RedisPublisher) extends IVoiceConferenceService with SystemConfiguration {

  val FROM_VOICE_CONF_SYSTEM_CHAN = "bigbluebutton:from-voice-conf:system"

  def voiceConfRecordingStarted(voiceConfId: String, recordStream: String, recording: java.lang.Boolean, timestamp: String) {
    val header = BbbCoreVoiceConfHeader(RecordingStartedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = RecordingStartedVoiceConfEvtMsgBody(voiceConfId, recordStream, recording.booleanValue(), timestamp)
    val envelope = BbbCoreEnvelope(RecordingStartedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new RecordingStartedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userJoinedVoiceConf(voiceConfId: String, voiceUserId: String, userId: String, callerIdName: String,
    callerIdNum: String, muted: java.lang.Boolean, talking: java.lang.Boolean, avatarURL: String) {
    println("******** FreeswitchConferenceService received voiceUserJoined vui=[" +
      userId + "] wui=[" + voiceUserId + "]")

    val header = BbbCoreVoiceConfHeader(UserJoinedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserJoinedVoiceConfEvtMsgBody(voiceConfId, voiceUserId, userId, callerIdName, callerIdNum,
      muted.booleanValue(), talking.booleanValue(), avatarURL)
    val envelope = BbbCoreEnvelope(UserJoinedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserJoinedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userLeftVoiceConf(voiceConfId: String, voiceUserId: String) {
    println("******** FreeswitchConferenceService received voiceUserLeft vui=[" + voiceUserId + "] conference=[" + voiceConfId + "]")

    val header = BbbCoreVoiceConfHeader(UserLeftVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserLeftVoiceConfEvtMsgBody(voiceConfId, voiceUserId)
    val envelope = BbbCoreEnvelope(UserLeftVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserLeftVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userLockedInVoiceConf(voiceConfId: String, voiceUserId: String, locked: java.lang.Boolean) {

  }

  def userMutedInVoiceConf(voiceConfId: String, voiceUserId: String, muted: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserMuted vui=[" + voiceUserId + "] muted=[" + muted + "]")

    val header = BbbCoreVoiceConfHeader(UserMutedInVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserMutedInVoiceConfEvtMsgBody(voiceConfId, voiceUserId, muted.booleanValue())
    val envelope = BbbCoreEnvelope(UserMutedInVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserMutedInVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def userTalkingInVoiceConf(voiceConfId: String, voiceUserId: String, talking: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserTalking vui=[" + voiceUserId + "] talking=[" + talking + "]")

    val header = BbbCoreVoiceConfHeader(UserTalkingInVoiceConfEvtMsg.NAME, voiceConfId)
    val body = UserTalkingInVoiceConfEvtMsgBody(voiceConfId, voiceUserId, talking.booleanValue())
    val envelope = BbbCoreEnvelope(UserTalkingInVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new UserTalkingInVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def deskShareStarted(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    println("******** FreeswitchConferenceService send deskShareStarted to BBB " + voiceConfId)

    val header = BbbCoreVoiceConfHeader(DeskshareStartedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = DeskshareStartedVoiceConfEvtMsgBody(voiceConf = voiceConfId, deskshareConf = voiceConfId,
      callerIdNum = callerIdNum, callerIdName = callerIdName)
    val envelope = BbbCoreEnvelope(DeskshareStartedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new DeskshareStartedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def deskShareEnded(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    println("******** FreeswitchConferenceService send deskShareStopped to BBB " + voiceConfId)

    val header = BbbCoreVoiceConfHeader(DeskshareStoppedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = DeskshareStoppedVoiceConfEvtMsgBody(voiceConf = voiceConfId, deskshareConf = voiceConfId,
      callerIdNum = callerIdNum, callerIdName = callerIdName)
    val envelope = BbbCoreEnvelope(DeskshareStoppedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new DeskshareStoppedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

  def deskShareRTMPBroadcastStarted(voiceConfId: String, streamname: String, vw: java.lang.Integer, vh: java.lang.Integer, timestamp: String) {
    println("******** FreeswitchConferenceService send deskShareRTMPBroadcastStarted to BBB " + voiceConfId)

    val header = BbbCoreVoiceConfHeader(DeskshareRtmpBroadcastStartedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = DeskshareRtmpBroadcastStartedVoiceConfEvtMsgBody(voiceConf = voiceConfId, deskshareConf = voiceConfId,
      stream = streamname, vidWidth = vw.intValue(), vidHeight = vh.intValue(),
      timestamp)
    val envelope = BbbCoreEnvelope(DeskshareRtmpBroadcastStartedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new DeskshareRtmpBroadcastStartedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)

  }

  def deskShareRTMPBroadcastStopped(voiceConfId: String, streamname: String, vw: java.lang.Integer, vh: java.lang.Integer, timestamp: String) {
    println("******** FreeswitchConferenceService send deskShareRTMPBroadcastStopped to BBB " + voiceConfId)

    val header = BbbCoreVoiceConfHeader(DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg.NAME, voiceConfId)
    val body = DeskshareRtmpBroadcastStoppedVoiceConfEvtMsgBody(voiceConf = voiceConfId, deskshareConf = voiceConfId,
      stream = streamname, vidWidth = vw.intValue(), vidHeight = vh.intValue(),
      timestamp)
    val envelope = BbbCoreEnvelope(DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg.NAME, Map("voiceConf" -> voiceConfId))

    val msg = new DeskshareRtmpBroadcastStoppedVoiceConfEvtMsg(header, body)
    val msgEvent = BbbCommonEnvCoreMsg(envelope, msg)

    val json = JsonUtil.toJson(msgEvent)
    sender.publish(fromVoiceConfRedisChannel, json)
  }

}
