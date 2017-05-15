package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging, Props}

object MeetingActor {
  def props(meetingId: String): Props =
  Props(classOf[MeetingActor], meetingId)
}

class MeetingActor(val meetingId: String) extends Actor with ActorLogging {

  def receive = {
    case msg: Connect => //handleConnect(msg)
    case msg: Disconnect => //handleDisconnect(msg)
    case msg: MessageFromClient => //handleMessageFromClient(msg)
  }
}
