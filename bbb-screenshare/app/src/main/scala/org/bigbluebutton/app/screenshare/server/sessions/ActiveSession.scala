package org.bigbluebutton.app.screenshare.server.sessions

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus

object ActiveSession {
  def apply(parent: Screenshare, bus: IEventsMessageBus, meetingId: String, streamId: String,
            token: String, recorded: Boolean, userId: String)(implicit context: ActorContext) =
    new ActiveSession(parent, bus, meetingId, streamId, token, recorded, userId)(context)
}

class ActiveSession(parent: Screenshare, bus: IEventsMessageBus, val meetingId: String,
                    val streamId: String, val token: String, val recorded: Boolean,
                    val userId: String)(implicit val context: ActorContext) {
//  val actorRef = context.actorOf(Session.props(parent, bus, meetingId, streamId, token, recorded, userId))
}
