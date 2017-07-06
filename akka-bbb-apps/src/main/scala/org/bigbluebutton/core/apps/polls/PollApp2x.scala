package org.bigbluebutton.core.apps.polls

import org.bigbluebutton.core.running.{ MeetingActor }

trait PollApp2x extends GetCurrentPollReqMsgHdlr
    with HidePollResultReqMsgHdlr
    with RespondToPollReqMsgHdlr
    with ShowPollResultReqMsgHdlr
    with StartCustomPollReqMsgHdlr
    with StartPollReqMsgHdlr
    with StopPollReqMsgHdlr {

  this: MeetingActor =>
}
