package org.bigbluebutton.core.apps.groupchat

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.bus.InternalEventBus
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }

class GroupChatApp(
    val liveMeeting: LiveMeeting,
    val outGW:       OutMsgRouter,
    val eventBus:    InternalEventBus
)(implicit val context: ActorContext) {

  val log = Logging(context.system, getClass)

}
