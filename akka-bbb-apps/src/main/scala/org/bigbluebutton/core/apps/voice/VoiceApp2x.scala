package org.bigbluebutton.core.apps.voice

import org.bigbluebutton.core.running.MeetingActor

trait VoiceApp2x extends UserJoinedVoiceConfEvtMsgHdlr
    with UserJoinedVoiceConfMessageHdlr
    with UserLeftVoiceConfEvtMsgHdlr
    with UserMutedInVoiceConfEvtMsgHdlr
    with UserTalkingInVoiceConfEvtMsgHdlr {

  this: MeetingActor =>
}
