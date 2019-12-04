package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ MsgToRedisEventBus, MsgToClientEventBus }

object User {
  def apply(
      userId:              String,
      msgToRedisEventBus:  MsgToRedisEventBus,
      meetingId:           String,
      msgToClientEventBus: MsgToClientEventBus
  )(implicit context: ActorContext): User =
    new User(userId, msgToRedisEventBus, meetingId, msgToClientEventBus)(context)
}

class User(
    val userId:          String,
    msgToRedisEventBus:  MsgToRedisEventBus,
    meetingId:           String,
    msgToClientEventBus: MsgToClientEventBus
)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(UserActor.props(userId, msgToRedisEventBus,
    meetingId, msgToClientEventBus), meetingId + "-" + userId)
}
