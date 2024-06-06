package org.bigbluebutton.core.apps.timer

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class TimerApp2x(implicit val context: ActorContext)
  extends CreateTimerPubMsgHdlr
  with ActivateTimerReqMsgHdlr
  with DeactivateTimerReqMsgHdlr
  with StartTimerReqMsgHdlr
  with StopTimerReqMsgHdlr
  with SwitchTimerReqMsgHdlr
  with SetTimerReqMsgHdlr
  with ResetTimerReqMsgHdlr
  with SetTrackReqMsgHdlr
  with TimerEndedPubMsgHdlr {

  val log = Logging(context.system, getClass)
}
