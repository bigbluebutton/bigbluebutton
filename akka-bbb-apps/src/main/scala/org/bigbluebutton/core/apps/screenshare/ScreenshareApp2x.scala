package org.bigbluebutton.core.apps.screenshare

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

class ScreenshareApp2x(implicit val context: ActorContext)
    extends ScreenshareStartedVoiceConfEvtMsgHdlr
    with ScreenshareStoppedVoiceConfEvtMsgHdlr
    with GetScreenshareStatusReqMsgHdlr
    with ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr
    with ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {

  val log = Logging(context.system, getClass)

}
