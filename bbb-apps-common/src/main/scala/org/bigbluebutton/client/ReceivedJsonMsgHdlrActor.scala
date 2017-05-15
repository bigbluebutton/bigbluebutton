package org.bigbluebutton.client

import akka.actor.{ Actor, ActorLogging, Props }


object ReceivedJsonMsgHdlrActor {
  def props(eventBus: IncomingEventBus, incomingJsonMessageBus: IncomingJsonMsgBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHdlrActor(val eventBus: IncomingEventBus,
                               val incomingJsonMessageBus: IncomingJsonMsgBus)
  extends Actor with ActorLogging with RxJsonMsgHdlrTrait {

  def receive = {
    case msg: ReceivedJsonMessage => handleReceivedJsonMessage(msg)


    case _ => // do nothing
  }

}
