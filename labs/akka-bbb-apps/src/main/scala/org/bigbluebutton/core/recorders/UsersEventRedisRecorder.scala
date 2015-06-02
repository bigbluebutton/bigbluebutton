package org.bigbluebutton.core.recorders

import org.bigbluebutton.conference.service.recorder.RecorderApplication
import org.bigbluebutton.core.api._
import org.bigbluebutton.conference.service.recorder.participants.ParticipantEndAndKickAllRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.AssignPresenterRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.ParticipantStatusChangeRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.ParticipantLeftRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.ParticipantJoinRecordEvent
import org.bigbluebutton.webconference.voice.ParticipantMutedVoiceRecordEvent
import org.bigbluebutton.webconference.voice.ParticipantTalkingVoiceRecordEvent
import org.bigbluebutton.webconference.voice.ParticipantJoinedVoiceRecordEvent
import org.bigbluebutton.webconference.voice.ParticipantLeftVoiceRecordEvent
import org.bigbluebutton.conference.service.recorder.participants.RecordStatusRecordEvent
import org.bigbluebutton.webconference.voice.StartRecordingVoiceRecordEvent

class UsersEventRedisRecorder(recorder: RecorderApplication) extends OutMessageListener2 {

  def handleMessage(msg: IOutMessage) {
    msg match {
      case msg: EndAndKickAll => handleEndAndKickAll(msg)
      case msg: PresenterAssigned => handleAssignPresenter(msg)
      case msg: UserJoined => handleUserJoined(msg)
      case msg: UserLeft => handleUserLeft(msg)
      case msg: UserStatusChange => handleUserStatusChange(msg)
      case msg: UserVoiceMuted => handleUserVoiceMuted(msg)
      case msg: UserVoiceTalking => handleUserVoiceTalking(msg)
      case msg: UserJoinedVoice => handleUserJoinedVoice(msg)
      case msg: UserLeftVoice => handleUserLeftVoice(msg)
      case msg: RecordingStatusChanged => handleRecordingStatusChanged(msg)
      case msg: UserRaisedHand => handleUserRaisedHand(msg)
      case msg: UserLoweredHand => handleUserLoweredHand(msg)
      case msg: UserSharedWebcam => handleUserSharedWebcam(msg)
      case msg: UserUnsharedWebcam => handleUserUnsharedWebcam(msg)
      case msg: VoiceRecordingStarted => handleVoiceRecordingStarted(msg)
      case msg: VoiceRecordingStopped => handleVoiceRecordingStopped(msg)
      case _ => //println("Unhandled message in UsersClientMessageSender")
    }
  }

  private def handleEndAndKickAll(msg: EndAndKickAll): Unit = {
    if (msg.recorded) {
      val ev = new ParticipantEndAndKickAllRecordEvent();
      ev.setTimestamp(TimestampGenerator.generateTimestamp);
      ev.setMeetingId(msg.meetingID);
      recorder.record(msg.meetingID, ev);
    }
  }

  private def handleUserJoined(msg: UserJoined): Unit = {
    if (msg.recorded) {
      val ev = new ParticipantJoinRecordEvent();
      ev.setTimestamp(TimestampGenerator.generateTimestamp);
      ev.setUserId(msg.user.userID);
      ev.setName(msg.user.name);
      ev.setMeetingId(msg.meetingID);
      ev.setRole(msg.user.role.toString());

      recorder.record(msg.meetingID, ev);
    }
  }

  def handleVoiceRecordingStarted(msg: VoiceRecordingStarted) {
    if (msg.recorded) {
      val evt = new StartRecordingVoiceRecordEvent(true);
      evt.setMeetingId(msg.meetingID);
      evt.setTimestamp(TimestampGenerator.generateTimestamp);
      evt.setBridge(msg.confNum);
      evt.setRecordingTimestamp(msg.timestamp);
      evt.setFilename(msg.recordingFile);
      recorder.record(msg.meetingID, evt);
    }
  }

  def handleVoiceRecordingStopped(msg: VoiceRecordingStopped) {
    if (msg.recorded) {
      val evt = new StartRecordingVoiceRecordEvent(false);
      evt.setMeetingId(msg.meetingID);
      evt.setTimestamp(TimestampGenerator.generateTimestamp);
      evt.setBridge(msg.confNum);
      evt.setRecordingTimestamp(msg.timestamp);
      evt.setFilename(msg.recordingFile);
      recorder.record(msg.meetingID, evt);
    }
  }

  def handleUserVoiceMuted(msg: UserVoiceMuted) {
    if (msg.recorded) {
      val ev = new ParticipantMutedVoiceRecordEvent()
      ev.setMeetingId(msg.meetingID);
      ev.setTimestamp(TimestampGenerator.generateTimestamp);
      ev.setBridge(msg.confNum);
      ev.setParticipant(msg.user.voiceUser.userId);
      ev.setMuted(msg.user.voiceUser.muted);

      recorder.record(msg.meetingID, ev);
    }
  }

  def handleUserVoiceTalking(msg: UserVoiceTalking) {
    if (msg.recorded) {
      val evt = new ParticipantTalkingVoiceRecordEvent();
      evt.setMeetingId(msg.meetingID);
      evt.setTimestamp(TimestampGenerator.generateTimestamp);
      evt.setBridge(msg.confNum);
      evt.setParticipant(msg.user.userID);
      evt.setTalking(msg.user.voiceUser.talking);

      recorder.record(msg.meetingID, evt);
    }
  }

  def handleUserJoinedVoice(msg: UserJoinedVoice) {
    if (msg.recorded) {
      val evt = new ParticipantJoinedVoiceRecordEvent();
      evt.setMeetingId(msg.meetingID);
      evt.setTimestamp(TimestampGenerator.generateTimestamp);
      evt.setBridge(msg.confNum);
      evt.setParticipant(msg.user.voiceUser.userId);
      evt.setCallerName(msg.user.voiceUser.callerName);
      evt.setCallerNumber(msg.user.voiceUser.callerNum);
      evt.setMuted(msg.user.voiceUser.muted);
      evt.setTalking(msg.user.voiceUser.talking);

      recorder.record(msg.meetingID, evt)
    }
  }

  def handleUserLeftVoice(msg: UserLeftVoice) {
    if (msg.recorded) {
      val evt = new ParticipantLeftVoiceRecordEvent();
      evt.setMeetingId(msg.meetingID);
      evt.setTimestamp(TimestampGenerator.generateTimestamp);
      evt.setBridge(msg.confNum);
      evt.setParticipant(msg.user.voiceUser.userId);
      recorder.record(msg.meetingID, evt);
    }
  }

  def handleRecordingStatusChanged(msg: RecordingStatusChanged) {
    if (msg.recorded) {
      val evt = new RecordStatusRecordEvent();
      evt.setMeetingId(msg.meetingID);
      evt.setTimestamp(TimestampGenerator.generateTimestamp);
      evt.setUserId(msg.userId);
      evt.setRecordingStatus(msg.recording.toString);

      recorder.record(msg.meetingID, evt);
    }
  }

  private def handleUserLeft(msg: UserLeft): Unit = {
    if (msg.recorded) {
      val ev = new ParticipantLeftRecordEvent();
      ev.setTimestamp(TimestampGenerator.generateTimestamp);
      ev.setUserId(msg.user.userID);
      ev.setMeetingId(msg.meetingID);

      recorder.record(msg.meetingID, ev);
    }

  }

  private def handleUserRaisedHand(msg: UserRaisedHand) {
    val status = UserStatusChange(msg.meetingID, msg.recorded,
      msg.userID, "raiseHand", true: java.lang.Boolean)
    handleUserStatusChange(status)
  }

  private def handleUserLoweredHand(msg: UserLoweredHand) {
    val status = UserStatusChange(msg.meetingID, msg.recorded,
      msg.userID, "raiseHand", false: java.lang.Boolean)
    handleUserStatusChange(status)
  }

  private def handleUserSharedWebcam(msg: UserSharedWebcam) {
    val status = UserStatusChange(msg.meetingID, msg.recorded,
      msg.userID, "hasStream", "true,stream=" + msg.stream)
    handleUserStatusChange(status)
  }

  private def handleUserUnsharedWebcam(msg: UserUnsharedWebcam) {
    val status = UserStatusChange(msg.meetingID, msg.recorded,
      msg.userID, "hasStream", "false,stream=" + msg.stream)
    handleUserStatusChange(status)
  }

  private def handleUserStatusChange(msg: UserStatusChange): Unit = {
    if (msg.recorded) {
      val ev = new ParticipantStatusChangeRecordEvent();
      ev.setTimestamp(TimestampGenerator.generateTimestamp);
      ev.setUserId(msg.userID);
      ev.setMeetingId(msg.meetingID);
      ev.setStatus(msg.status);
      ev.setValue(msg.value.toString());

      recorder.record(msg.meetingID, ev);
    }
  }

  private def handleAssignPresenter(msg: PresenterAssigned): Unit = {
    if (msg.recorded) {
      val event = new AssignPresenterRecordEvent();
      event.setMeetingId(msg.meetingID);
      event.setTimestamp(TimestampGenerator.generateTimestamp);
      event.setUserId(msg.presenter.presenterID);
      event.setName(msg.presenter.presenterName);
      event.setAssignedBy(msg.presenter.assignedBy);

      recorder.record(msg.meetingID, event);
    }

  }
}