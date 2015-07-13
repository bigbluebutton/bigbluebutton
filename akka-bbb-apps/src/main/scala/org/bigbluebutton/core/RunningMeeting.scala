package org.bigbluebutton.core

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.core.api.MessageOutGateway

object RunningMeeting {
  def apply(mProps: MeetingProperties, outGW: OutMessageGateway)(implicit context: ActorContext) =
    new RunningMeeting(mProps, outGW)(context)
}

class RunningMeeting(val mProps: MeetingProperties, val outGW: OutMessageGateway)(implicit val context: ActorContext) {

  val actorRef = context.actorOf(MeetingActor.props(mProps, outGW), mProps.meetingID)
}