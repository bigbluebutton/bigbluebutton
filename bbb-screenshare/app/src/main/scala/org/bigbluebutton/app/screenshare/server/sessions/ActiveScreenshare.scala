package org.bigbluebutton.app.screenshare.server.sessions

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.app.screenshare.events.IEventsMessageBus

object ActiveScreenshare {
  def apply(screenshareSessionManager: ScreenshareSessionManager, bus: IEventsMessageBus,
            meetingId:String)(implicit context: ActorContext) = new ActiveScreenshare(screenshareSessionManager, bus, meetingId)(context)
}

class ActiveScreenshare(val screenshareSessionManager: ScreenshareSessionManager,
                        val bus: IEventsMessageBus, val meetingId:String)(implicit val context: ActorContext) {
  val actorRef = context.actorOf(MeetingActor.props(screenshareSessionManager, bus, meetingId))
}
