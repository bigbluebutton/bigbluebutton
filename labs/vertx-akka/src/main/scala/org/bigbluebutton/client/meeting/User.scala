package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ InternalMessageBus }

object User {
  def apply(
      userId:       String,
      connEventBus: InternalMessageBus,
      meetingId:    String
  )(implicit context: ActorContext): User =
    new User(userId, connEventBus, meetingId)(context)
}

class User(
    val userId:   String,
    connEventBus: InternalMessageBus,
    meetingId:    String
)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(UserActor.props(userId, connEventBus, meetingId), meetingId + "-" + userId)
}
