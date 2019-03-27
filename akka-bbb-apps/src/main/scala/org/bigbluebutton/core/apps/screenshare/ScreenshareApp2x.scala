package org.bigbluebutton.core.apps.screenshare

import akka.actor.ActorContext
import akka.event.Logging

class ScreenshareApp2x(implicit val context: ActorContext)
  extends ScreenshareStartedVoiceConfEvtMsgHdlr
  with ScreenshareStoppedVoiceConfEvtMsgHdlr
  with GetScreenshareStatusReqMsgHdlr
  with ScreenshareRtmpBroadcastStartedVoiceConfEvtMsgHdlr
  with ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsgHdlr {

  val log = Logging(context.system, getClass)

}
