package org.bigbluebutton.client.meeting

import akka.actor.ActorContext

object Meeting {
  def apply(meetingId: String)(implicit context: ActorContext) =
  new Meeting(meetingId)(context)
}

class Meeting(val meetingId: String)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(MeetingActor.props(meetingId), meetingId)
}
