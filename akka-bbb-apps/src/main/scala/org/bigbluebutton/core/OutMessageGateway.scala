package org.bigbluebutton.core

import akka.actor.ActorRef
import akka.actor.ActorContext
import org.bigbluebutton.core.api.MessageOutGateway
import org.bigbluebutton.core.service.recorder.RecorderApplication
import org.bigbluebutton.core.api.IOutMessage

object OutMessageGateway {
  def apply(meetingId: String, recorder: RecorderApplication, sender: MessageSender)(implicit context: ActorContext) =
    new OutMessageGateway(meetingId, recorder, sender)(context)
}

class OutMessageGateway(val meetingId: String, val recorder: RecorderApplication, val sender: MessageSender)(implicit val context: ActorContext) {

  private val outGW = context.actorOf(OutMessageGatewayActor.props(meetingId, recorder, sender), meetingId)

  def send(msg: IOutMessage) {
    outGW forward msg
  }
}