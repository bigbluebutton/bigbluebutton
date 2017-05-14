package org.bigbluebutton.client.meeting

import akka.actor.ActorContext

object User {
  def apply(userId: String) (implicit context: ActorContext): User =
    new User(userId)(context)
}

class User(var userId: String)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(UserActor.props(userId), userId)
}
