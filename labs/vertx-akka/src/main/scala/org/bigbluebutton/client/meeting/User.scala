package org.bigbluebutton.client.meeting

import akka.actor.ActorContext
import org.bigbluebutton.client.bus.{ MsgToAkkaAppsEventBus, MsgToClientEventBus }

object User {
  def apply(userId: String,
    msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
    meetingId: String,
    msgToClientEventBus: MsgToClientEventBus)(implicit context: ActorContext): User =
    new User(userId, msgToAkkaAppsEventBus, meetingId, msgToClientEventBus)(context)
}

class User(val userId: String,
    msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
    meetingId: String,
    msgToClientEventBus: MsgToClientEventBus)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(UserActor.props(userId, msgToAkkaAppsEventBus,
    meetingId, msgToClientEventBus), meetingId + "-" + userId)
}
