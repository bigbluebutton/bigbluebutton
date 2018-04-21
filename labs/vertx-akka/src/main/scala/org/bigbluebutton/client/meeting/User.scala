package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ FromConnEventBus }

object User {
  def apply(userId: String,
    connEventBus: FromConnEventBus,
    meetingId: String)(implicit context: ActorContext): User =
    new User(userId, connEventBus, meetingId)(context)
}

class User(val userId: String,
    connEventBus: FromConnEventBus,
    meetingId: String)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(UserActor.props(userId, connEventBus, meetingId), meetingId + "-" + userId)
}
