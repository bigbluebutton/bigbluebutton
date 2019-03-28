package org.bigbluebutton.core.apps.polls

import akka.actor.ActorContext
import akka.event.Logging

class PollApp2x(implicit val context: ActorContext)
  extends GetCurrentPollReqMsgHdlr
  with RespondToPollReqMsgHdlr
  with ShowPollResultReqMsgHdlr
  with StartCustomPollReqMsgHdlr
  with StartPollReqMsgHdlr
  with StopPollReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
