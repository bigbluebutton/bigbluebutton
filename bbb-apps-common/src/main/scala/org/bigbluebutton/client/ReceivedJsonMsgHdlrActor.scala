package org.bigbluebutton.client

import akka.actor.{ Actor, ActorLogging, Props }

object ReceivedJsonMsgHdlrActor {
  def props(eventBus: IncomingEventBus, incomingJsonMessageBus: IncomingJsonMsgBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHdlrActor(val eventBus: IncomingEventBus,
                               val incomingJsonMessageBus: IncomingJsonMsgBus)
  extends Actor with ActorLogging {

  def receive = {
    case msg: ReceivedJsonMessage =>
    //    JsonMsgUnmarshaller.decode(msg.data) match {
    //      case Some(m) => handleReceivedJsonMsg(m)
    //      case None => log.warning("Invalid JSON message. {}", msg.data)
    //    }

    case _ => // do nothing
  }

}
