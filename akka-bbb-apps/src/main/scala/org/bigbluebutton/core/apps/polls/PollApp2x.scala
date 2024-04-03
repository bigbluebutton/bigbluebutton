package org.bigbluebutton.core.apps.polls

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging

class PollApp2x(implicit val context: ActorContext)
  extends GetCurrentPollReqMsgHdlr
  with RespondToPollReqMsgHdlr
  with RespondToTypedPollReqMsgHdlr
  with ShowPollResultReqMsgHdlr
  with StartCustomPollReqMsgHdlr
  with StartPollReqMsgHdlr
  with StopPollReqMsgHdlr {

  val log = Logging(context.system, getClass)
}
