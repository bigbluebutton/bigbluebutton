package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ MsgToAkkaAppsEventBus, MsgToClientEventBus }

object Meeting {
  def apply(meetingId: String, msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
    msgToClientEventBus: MsgToClientEventBus)(implicit context: ActorContext) =
    new Meeting(meetingId, msgToAkkaAppsEventBus, msgToClientEventBus)(context)
}

class Meeting(val meetingId: String, msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
    msgToClientEventBus: MsgToClientEventBus)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(MeetingActor.props(meetingId, msgToAkkaAppsEventBus, msgToClientEventBus), meetingId)
}
