package org.bigbluebutton.freeswitch

import org.bigbluebutton.freeswitch.voice.IVoiceConferenceService
import org.bigbluebutton.core.api._
import org.bigbluebutton.endpoint.redis.RedisPublisher

class VoiceConferenceService(sender: RedisPublisher) extends IVoiceConferenceService {

  def voiceStartedRecording(conference: String, recordingFile: String,
    timestamp: String, recording: java.lang.Boolean) {
    val fsRec = new FsRecording(conference, recordingFile, timestamp, recording)

  }

  def voiceUserJoined(userId: String, webUserId: String, conference: String,
    callerIdNum: String, callerIdName: String,
    muted: java.lang.Boolean, talking: java.lang.Boolean) {
    //    println("******** FreeswitchConferenceService received voiceUserJoined vui=[" + userId + "] wui=[" + webUserId + "]")
    val vuj = new FsVoiceUserJoined(userId, webUserId,
      conference, callerIdNum,
      callerIdName, muted,
      talking)

  }

  def voiceUserLeft(userId: String, conference: String) {
    //    println("******** FreeswitchConferenceService received voiceUserLeft vui=[" + userId + "] conference=[" + conference + "]")
    val vul = new FsVoiceUserLeft(userId, conference)

  }

  def voiceUserLocked(userId: String, conference: String, locked: java.lang.Boolean) {
    val vul = new FsVoiceUserLocked(userId, conference, locked)

  }

  def voiceUserMuted(userId: String, conference: String, muted: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserMuted vui=[" + userId + "] muted=[" + muted + "]")
    val vum = new FsVoiceUserMuted(userId, conference, muted)

  }

  def voiceUserTalking(userId: String, conference: String, talking: java.lang.Boolean) {
    println("******** FreeswitchConferenceService received voiceUserTalking vui=[" + userId + "] talking=[" + talking + "]")
    val vut = new FsVoiceUserTalking(userId, conference, talking)

  }
}