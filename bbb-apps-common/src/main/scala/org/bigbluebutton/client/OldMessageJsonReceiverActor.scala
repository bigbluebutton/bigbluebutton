package org.bigbluebutton.client

import akka.actor.{Actor, ActorLogging, Props}

object OldMessageJsonReceiverActor{
  def props(gw: OldMessageReceivedGW): Props = Props(classOf[OldMessageJsonReceiverActor], gw)
}

class OldMessageJsonReceiverActor(gw: OldMessageReceivedGW) extends Actor with ActorLogging {

  def receive = {
    case msg: OldReceivedJsonMessage => gw.handle(msg.pattern, msg.channel, msg.msg)
  }
}
