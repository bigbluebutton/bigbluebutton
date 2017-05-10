package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.core.bus.{ IncomingEventBus, IncomingJsonMessageBus, ReceivedJsonMessage }

object ReceivedJsonMsgHandlerActor {
  def props(eventBus: IncomingEventBus, incomingJsonMessageBus: IncomingJsonMessageBus): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHandlerActor(
  val eventBus: IncomingEventBus,
  val incomingJsonMessageBus: IncomingJsonMessageBus)
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