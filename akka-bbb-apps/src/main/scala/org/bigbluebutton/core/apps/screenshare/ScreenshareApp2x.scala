package org.bigbluebutton.core.apps.screenshare

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.running.LiveMeeting

class ScreenshareApp2x(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMessageGateway
)(implicit val context: ActorContext)
    extends ScreenshareStartedVoiceConfEvtMsgHdlr
    with ScreenshareStoppedVoiceConfEvtMsgHdlr
    with GetScreenshareStatusReqMsgHdlr
    with ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr
    with ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {

  val log = Logging(context.system, getClass)

}
