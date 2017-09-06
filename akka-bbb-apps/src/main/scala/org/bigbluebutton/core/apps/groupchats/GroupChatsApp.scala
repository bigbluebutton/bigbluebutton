package org.bigbluebutton.core.apps.groupchats

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

class GroupChatsApp(
  val liveMeeting: LiveMeeting,
  val outGW:       OutMsgRouter,
  val eventBus:    InternalEventBus
)(implicit val context: ActorContext)
    extends GetGroupChatsReqMsgHdlr {

  val log = Logging(context.system, getClass)

}
