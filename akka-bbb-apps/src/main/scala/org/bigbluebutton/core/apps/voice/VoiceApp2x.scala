package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.RecordingStartedVoiceConfEvtMsgHdlr

object VoiceCallState {
  val NOT_IN_CALL = "NOT_IN_CALL"
  val IN_ECHO_TEST = "IN_ECHO_TEST"
  val IN_CONFERENCE = "IN_CONFERENCE"
  val CALL_STARTED = "CALL_STARTED"
  val CALL_ENDED = "CALL_ENDED"
}
trait VoiceApp2x extends UserJoinedVoiceConfEvtMsgHdlr
  with UserJoinedVoiceConfMessageHdlr
  with UserLeftVoiceConfEvtMsgHdlr
  with UserMutedInVoiceConfEvtMsgHdlr
  with UserTalkingInVoiceConfEvtMsgHdlr
  with RecordingStartedVoiceConfEvtMsgHdlr
  with VoiceConfRunningEvtMsgHdlr
  with SyncGetVoiceUsersMsgHdlr
  with VoiceConfCallStateEvtMsgHdlr
  with UserStatusVoiceConfEvtMsgHdlr {

  this: MeetingActor =>
}
