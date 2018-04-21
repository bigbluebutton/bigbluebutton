package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ FromConnEventBus }

object Meeting {
  def apply(meetingId: String, connEventBus: FromConnEventBus)(implicit context: ActorContext) =
    new Meeting(meetingId, connEventBus)(context)
}

class Meeting(val meetingId: String, connEventBus: FromConnEventBus)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(MeetingActor.props(meetingId, connEventBus), meetingId)
}
