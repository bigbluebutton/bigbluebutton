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
import org.bigbluebutton.common.messages.DeskShareRecordingStartedEventMessage
import org.bigbluebutton.common.messages.DeskShareRecordingStoppedEventMessage
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStartedEventMessage
import org.bigbluebutton.common.messages.DeskShareRTMPBroadcastStoppedEventMessage

//import org.bigbluebutton.common.messages.DeskShareViewerJoinedEventMessage
//import org.bigbluebutton.common.messages.DeskShareViewerLeftEventMessage
//import org.bigbluebutton.common.messages.DeskShareStartRecordingEventMessage
//import org.bigbluebutton.common.messages.DeskShareStopRecordingEventMessage

class VoiceConferenceService(sender: RedisPublisher) extends IVoiceConferenceService {

  val FROM_VOICE_CONF_SYSTEM_CHAN = "bigbluebutton:from-voice-conf:system";

  def voiceConfRecordingStarted(voiceConfId: String, recordStream: String, recording: java.lang.Boolean, timestamp: String) {
    val msg = new VoiceConfRecordingStartedMessage(voiceConfId, recordStream, recording, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userJoinedVoiceConf(voiceConfId: String, voiceUserId: String, userId: String, callerIdName: String,
    callerIdNum: String, muted: java.lang.Boolean, talking: java.lang.Boolean) {
    //    println("******** FreeswitchConferenceService received voiceUserJoined vui=[" + userId + "] wui=[" + webUserId + "]")
    val msg = new UserJoinedVoiceConfMessage(voiceConfId, voiceUserId, userId, callerIdName, callerIdNum, muted, talking)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def userLeftVoiceConf(voiceConfId: String, voiceUserId: String) {
    //    println("******** FreeswitchConferenceService received voiceUserLeft vui=[" + userId + "] conference=[" + conference + "]")
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
    println("******** FreeswitchConferenceService received deskShareStarted")
    printf(" IN FS DeskShareStartedEventMessage")
    val msg = new DeskShareStartedEventMessage(voiceConfId, callerIdNum, callerIdName)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareEnded(voiceConfId: String, callerIdNum: String, callerIdName: String) {
    println("******** FreeswitchConferenceService received deskShareStopped")
    printf(" IN FS DeskShareStoppedEventMessage")
    val msg = new DeskShareStoppedEventMessage(voiceConfId, callerIdNum, callerIdName)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRecordingStarted(voiceConfId: String, filename: String,
    channels: java.lang.Integer, samplerate: java.lang.Integer, vw: java.lang.Integer,
    vh: java.lang.Integer, fps: java.lang.Double, timestamp: String) {
    println("******** FreeswitchConferenceService received deskShareRecordingStarted")
    printf(" IN FS deskShareRecordingStarted")
    val msg = new DeskShareRecordingStartedEventMessage(voiceConfId, filename, channels,
      samplerate, vw, vh, fps, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRecordingStopped(voiceConfId: String, filename: String,
    channels: java.lang.Integer, samplerate: java.lang.Integer, vw: java.lang.Integer,
    vh: java.lang.Integer, fps: java.lang.Double, timestamp: String) {
    println("******** FreeswitchConferenceService received deskShareRecordingStopped")
    printf(" IN FS deskShareRecordingStopped")
    val msg = new DeskShareRecordingStoppedEventMessage(voiceConfId, filename, channels,
      samplerate, vw, vh, fps, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRTMPBroadcastStarted(voiceConfId: String, filename: String,
    channels: java.lang.Integer, samplerate: java.lang.Integer, vw: java.lang.Integer,
    vh: java.lang.Integer, fps: java.lang.Double, timestamp: String) {
    println("******** FreeswitchConferenceService received deskShareRTMPBroadcastStarted")
    val msg = new DeskShareRTMPBroadcastStartedEventMessage(voiceConfId, filename, channels,
      samplerate, vw, vh, fps, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  def deskShareRTMPBroadcastStopped(voiceConfId: String, filename: String,
    channels: java.lang.Integer, samplerate: java.lang.Integer, vw: java.lang.Integer,
    vh: java.lang.Integer, fps: java.lang.Double, timestamp: String) {
    println("******** FreeswitchConferenceService received deskShareRTMPBroadcastStopped")
    printf(" IN FS deskShareRTMPBroadcastStopped")
    val msg = new DeskShareRTMPBroadcastStoppedEventMessage(voiceConfId, filename, channels,
      samplerate, vw, vh, fps, timestamp)
    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  }

  //
  //  def deskShareViewerJoined(voiceConfId: String, callerIdNum: String, callerIdName: String) {
  //    println("******** FreeswitchConferenceService received deskShareViewerJoined")
  //    val msg = new DeskShareViewerJoinedEventMessage(voiceConfId, callerIdNum, callerIdName)
  //    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  //  }
  //
  //  def deskShareViewerLeft(voiceConfId: String, callerIdNum: String, callerIdName: String) {
  //    println("******** FreeswitchConferenceService received deskShareViewerLeft")
  //    val msg = new DeskShareViewerLeftEventMessage(voiceConfId, callerIdNum, callerIdName)
  //    sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  //  }

  //  def deskShareRecording(voiceConfId: String, recordingFilename: String, record: Boolean, timestamp: String) {
  //    if (record) {
  //      println("******** FreeswitchConferenceService received deskShareRecording - start")
  //      val msg = new DeskShareRecordingStartedEventMessage(voiceConfId, recordingFilename, timestamp)
  //      sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  //    } else {
  //      println("******** FreeswitchConferenceService received deskShareRecording - stop")
  //      val msg = new DeskShareRecordingStoppedEventMessage(voiceConfId, recordingFilename, timestamp)
  //      sender.publish(FROM_VOICE_CONF_SYSTEM_CHAN, msg.toJson())
  //    }
  //  }

}