package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ MsgToRedisEventBus, MsgToClientEventBus }

object Meeting {
  def apply(meetingId: String, msgToRedisEventBus: MsgToRedisEventBus,
            msgToClientEventBus: MsgToClientEventBus)(implicit context: ActorContext) =
    new Meeting(meetingId, msgToRedisEventBus, msgToClientEventBus)(context)
}

class Meeting(val meetingId: String, msgToRedisEventBus: MsgToRedisEventBus,
              msgToClientEventBus: MsgToClientEventBus)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(MeetingActor.props(meetingId, msgToRedisEventBus, msgToClientEventBus), meetingId)
}
