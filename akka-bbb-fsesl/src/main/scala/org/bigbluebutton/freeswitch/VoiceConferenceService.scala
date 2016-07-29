package org.bigbluebutton.freeswitch

import org.bigbluebutton.freeswitch.voice.IVoiceConferenceService
import org.bigbluebutton.endpoint.redis.RedisPublisher
import org.bigbluebutton.common.messages.VoiceConfRecordingStartedMessage
import org.bigbluebutton.common.messages.UserJoinedVoiceConfMessage
import org.bigbluebutton.common.messages.UserLeftVoiceConfMessage
import org.bigbluebutton.common.messages.UserMutedInVoiceConfMessage
import org.bigbluebutton.common.messages.UserTalkingInVoiceConfMessage
import org.bigbluebutton.common.messages.DeskShareStartedEventMessage
import org.bigbluebutton.common.messages.DeskShareStoppedEventMessage
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStartedEventMessage
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStoppedEventMessage

class VoiceConferenceService(sender: RedisPublisher) extends IVoiceConferenceService {

  val FROM_VOICE_CONF_SYSTEM_CHAN = "bigbluebutton:from-voice-conf:system"

  def voiceConfRecordingStarted(voiceConfId: String, recordStream: String, recording: java.lang.Boolean, timestamp: String) {
    val msg = new VoiceConfRecordingStartedMessage(voiceConfId, recordStream, recording, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userJoinedVoiceConf(voiceConfId: String, voiceUserId: String, userId: String, callerIdName: String,
    callerIdNum: String, muted: java.lang.Boolean, talking: java.lang.Boolean, avatarURL: String) {
    println("******** FreeswitchConferenceService received voiceUserJoined vui=[" +
      userId + "] wui=[" + voiceUserId + "]")
    val msg = new UserJoinedVoiceConfMessage(voiceConfId, voiceUserId, userId, callerIdName, callerIdNum, muted, talking, avatarURL)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userLeftVoiceConf(voiceConfId: String, voiceUserId: String) {
    println("******** FreeswitchConferenceService received voiceUserLeft vui=[" + voiceUserId + "] conference=[" + voiceConfId + "]")
    val msg = new UserLeftVoiceConfMessage(voiceConfId, voiceUserId)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userLockedInVoiceConf(voiceConfId: String, voiceUserId: String, locked: java.lang.Boolean) {

  }

  def userMutedInVoiceConf(voiceConfId: String, voiceUserId: String, muted: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserMuted vui=[" + voiceUserId + "] muted=[" + muted + "]")
    val msg = new UserMutedInVoiceConfMessage(voiceConfId, voiceUserId, muted)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userTalkingInVoiceConf(voiceConfId: String, voiceUserId: String, talking: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserTalking vui=[" + voiceUserId + "] talking=[" + talking + "]")
    val msg = new UserTalkingInVoiceConfMessage(voiceConfId, voiceUserId, talking)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareStarted(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    println("******** FreeswitchConferenceService send deskShareStarted to BBB " + voiceConfId)
    val msg = new DeskShareStartedEventMessage(voiceConfId, callerIdNum, callerIdName)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareEnded(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    println("******** FreeswitchConferenceService send deskShareStopped to BBB " + voiceConfId)
    val msg = new DeskShareStoppedEventMessage(voiceConfId, callerIdNum, callerIdName)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRTMPBroadcastStarted(voiceConfId: String, streamname: String, vw: java.lang.Integer, vh: java.lang.Integer, timestamp: String) {
    println("******** FreeswitchConferenceService send deskShareRTMPBroadcastStarted to BBB " + voiceConfId)
    val msg = new DeskShareRTMPBroadcastStartedEventMessage(voiceConfId, streamname, vw, vh, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRTMPBroadcastStopped(voiceConfId: String, streamname: String, vw: java.lang.Integer, vh: java.lang.Integer, timestamp: String) {
    println("******** FreeswitchConferenceService send deskShareRTMPBroadcastStopped to BBB " + voiceConfId)
    val msg = new DeskShareRTMPBroadcastStoppedEventMessage(voiceConfId, streamname, vw, vh, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

}
