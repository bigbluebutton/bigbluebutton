package org.bigbluebutton.api2.bus

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.common2.bus.OldReceivedJsonMessage

object OldMessageJsonReceiverActor {
  def props(gw: OldMessageReceivedGW): Props = Props(classOf[OldMessageJsonReceiverActor], gw)
}

class OldMessageJsonReceiverActor(gw: OldMessageReceivedGW) extends Actor with ActorLogging {

  def receive = {
    case msg: OldReceivedJsonMessage => //gw.handle(msg.pattern, msg.channel, msg.msg)
  }
}
