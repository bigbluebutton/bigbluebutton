package org.bigbluebutton.app.screenshare.server.sessions

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus

object ActiveScreenshare {
  def apply(screenshareSessionManager: ScreenshareManager, bus: IEventsMessageBus,
    meetingId: String, record: Boolean)(implicit context: ActorContext) =
    new ActiveScreenshare(screenshareSessionManager, bus, meetingId, record)(context)
}

class ActiveScreenshare(
  val screenshareSessionManager: ScreenshareManager,
  val bus: IEventsMessageBus, val meetingId: String, record: Boolean)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(Screenshare.props(screenshareSessionManager, bus, meetingId, record))
}
