package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._

class VoiceInGateway(bbbGW: BigBlueButtonGateway) {

  def muteAllExceptPresenter(meetingID: String, requesterID: String, mute: Boolean) {
    bbbGW.accept(new MuteAllExceptPresenterRequest(meetingID, requesterID, mute))
  }

  def muteAllUsers(meetingID: String, requesterID: String, mute: Boolean) {
    bbbGW.accept(new MuteMeetingRequest(meetingID, requesterID, mute))
  }

  def isMeetingMuted(meetingID: String, requesterID: String) {
    bbbGW.accept(new IsMeetingMutedRequest(meetingID, requesterID))
  }

  def muteUser(meetingID: String, requesterID: String, userID: String, mute: Boolean) {
    bbbGW.accept(new MuteUserRequest(meetingID, requesterID, userID, mute))
  }

  def lockUser(meetingID: String, requesterID: String, userID: String, lock: Boolean) {
    bbbGW.accept(new LockUserRequest(meetingID, requesterID, userID, lock))
  }

  def ejectUserFromVoice(meetingID: String, userId: String, ejectedBy: String) {
    bbbGW.accept(new EjectUserFromVoiceRequest(meetingID, userId, ejectedBy))
  }

  def voiceUserJoined(voiceConfId: String, voiceUserId: String, userId: String, callerIdName: String,
    callerIdNum: String, muted: Boolean, talking: Boolean) {
    //	  println("VoiceInGateway: Got voiceUserJoined message for meeting [" + meetingId + "] user[" + callerIdName + "]")
    val voiceUser = new VoiceUser(voiceUserId, userId, callerIdName, callerIdNum, true, false, muted, talking)
    val msg = new UserJoinedVoiceConfMessage(voiceConfId, voiceUserId, userId, callerIdName,
      callerIdNum, muted, talking)

    bbbGW.acceptUserJoinedVoiceConfMessage(msg)
  }

  def voiceUserLeft(voiceConfId: String, voiceUserId: String) {
    //	  println("VoiceInGateway: Got voiceUserLeft message for meeting [" + meetingId + "] user[" + userId + "]")
    bbbGW.acceptUserLeftVoiceConfMessage(new UserLeftVoiceConfMessage(voiceConfId, voiceUserId))
  }

  def voiceUserLocked(voiceConfId: String, voiceUserId: String, locked: Boolean) {
    bbbGW.acceptUserLockedInVoiceConfMessage(new UserLockedInVoiceConfMessage(voiceConfId, voiceUserId, locked))
  }

  def voiceUserMuted(voiceConfId: String, voiceUserId: String, muted: Boolean) {
    bbbGW.acceptUserMutedInVoiceConfMessage(new UserMutedInVoiceConfMessage(voiceConfId, voiceUserId, muted))
  }

  def voiceUserTalking(voiceConfId: String, voiceUserId: String, talking: Boolean) {
    bbbGW.acceptUserTalkingInVoiceConfMessage(new UserTalkingInVoiceConfMessage(voiceConfId, voiceUserId, talking))
  }

  def voiceRecording(voiceConfId: String, recordingFile: String, timestamp: String, recording: java.lang.Boolean) {
    bbbGW.acceptVoiceConfRecordingStartedMessage(new VoiceConfRecordingStartedMessage(voiceConfId, recordingFile, recording, timestamp))
  }
}