package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.handlers.RecordingStartedVoiceConfEvtMsgHdlr

trait VoiceApp2x extends UserJoinedVoiceConfEvtMsgHdlr
    with UserJoinedVoiceConfMessageHdlr
    with UserLeftVoiceConfEvtMsgHdlr
    with UserMutedInVoiceConfEvtMsgHdlr
    with UserTalkingInVoiceConfEvtMsgHdlr
    with RecordingStartedVoiceConfEvtMsgHdlr
    with VoiceConfRunningEvtMsgHdlr {

  this: MeetingActor =>
}
