package org.bigbluebutton.core.pubsub

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.core.MessageSender
//import org.bigbluebutton.common2.messages.MeetingCreatedEvt

object JsonMsgSenderActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[JsonMsgSenderActor], msgSender)
}

class JsonMsgSenderActor(val service: MessageSender)
    extends Actor with ActorLogging {

  def receive = {
    //  case msg: MeetingCreatedEvt => println(msg)
    case msg: String => println(msg)
  }
}
