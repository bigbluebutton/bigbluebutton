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
import org.slf4j.Logger
import org.slf4j.LoggerFactory

class VoiceConferenceService(sender: RedisPublisher) extends IVoiceConferenceService {
  private val log: Logger = LoggerFactory.getLogger(classOf[VoiceConferenceService])
  val FROM_VOICE_CONF_SYSTEM_CHAN = "bigbluebutton:from-voice-conf:system"
  private final val DESKSHARE_CONFERENCE_NAME_SUFFIX = "-DESKSHARE"

  def voiceConfRecordingStarted(voiceConfId: String, recordStream: String, recording: java.lang.Boolean, timestamp: String) {
    val msg = new VoiceConfRecordingStartedMessage(voiceConfId, recordStream, recording, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userJoinedVoiceConf(voiceConfId: String, voiceUserId: String, userId: String, callerIdName: String,
    callerIdNum: String, muted: java.lang.Boolean, talking: java.lang.Boolean, avatarURL: String) {
    log.info("******** FreeswitchConferenceService received voiceUserJoined vui=[" + userId + "] " +
      "vui=[" + voiceUserId + "]")
    val msg = new UserJoinedVoiceConfMessage(voiceConfId, voiceUserId, userId, callerIdName, callerIdNum, muted, talking, avatarURL)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userLeftVoiceConf(voiceConfId: String, voiceUserId: String) {
    log.info("******** FreeswitchConferenceService received voiceUserLeft vui=[" + voiceUserId + "] voiceConfId=[" + voiceConfId + "]")
    val msg = new UserLeftVoiceConfMessage(voiceConfId, voiceUserId)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userLockedInVoiceConf(voiceConfId: String, voiceUserId: String, locked: java.lang.Boolean) {

  }

  def userMutedInVoiceConf(voiceConfId: String, voiceUserId: String, muted: java.lang.Boolean) {
    log.info("******** FreeswitchConferenceService received voiceUserMuted vui=[" + voiceUserId +
      "] muted=[" + muted + "]")
    val msg = new UserMutedInVoiceConfMessage(voiceConfId, voiceUserId, muted)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userTalkingInVoiceConf(voiceConfId: String, voiceUserId: String, talking: java.lang.Boolean) {
    log.info("******** FreeswitchConferenceService received voiceUserTalking vui=[" + voiceUserId + "] talking=[" + talking + "]")
    val msg = new UserTalkingInVoiceConfMessage(voiceConfId, voiceUserId, talking)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareStarted(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    val trimmedVoiceConfId = voiceConfId.replace(DESKSHARE_CONFERENCE_NAME_SUFFIX, "")
    log.info("******** FreeswitchConferenceService send deskShareStarted to BBB " + trimmedVoiceConfId)
    val msg = new DeskShareStartedEventMessage(trimmedVoiceConfId, callerIdNum, callerIdName)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareEnded(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    val trimmedVoiceConfId = voiceConfId.replace(DESKSHARE_CONFERENCE_NAME_SUFFIX, "")
    log.info("******** FreeswitchConferenceService send deskShareStopped to BBB " + trimmedVoiceConfId)
    val msg = new DeskShareStoppedEventMessage(trimmedVoiceConfId, callerIdNum, callerIdName)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRTMPBroadcastStarted(voiceConfId: String, streamname: String, vw: java.lang.Integer, vh: java.lang.Integer, timestamp: String) {
    val trimmedVoiceConfId = voiceConfId.replace(DESKSHARE_CONFERENCE_NAME_SUFFIX, "")
    log.info("******** FreeswitchConferenceService send deskShareRTMPBroadcastStarted to BBB " + trimmedVoiceConfId)
    val msg = new DeskShareRTMPBroadcastStartedEventMessage(trimmedVoiceConfId, streamname, vw, vh, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRTMPBroadcastStopped(voiceConfId: String, streamname: String, vw: java.lang.Integer, vh: java.lang.Integer, timestamp: String) {
    val trimmedVoiceConfId = voiceConfId.replace(DESKSHARE_CONFERENCE_NAME_SUFFIX, "")
    log.info("******** FreeswitchConferenceService send deskShareRTMPBroadcastStopped to BBB " + trimmedVoiceConfId)
    val msg = new DeskShareRTMPBroadcastStoppedEventMessage(trimmedVoiceConfId, streamname, vw, vh, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

}
