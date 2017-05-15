package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging, Props}

case class ConnectionInfo(meetingId: String, userId: String, token: String,
                          connId: String, sessionId: String)
case class Connect(connectionInfo: ConnectionInfo)
case class Disconnect(connectionInfo: ConnectionInfo)
case class MessageFromClient(connectionInfo: ConnectionInfo, json: String)

object MeetingManagerActor {
  def props(): Props =
  Props(classOf[MeetingManagerActor])
}

class MeetingManagerActor extends Actor with ActorLogging {

  def receive = {
    case msg: Connect => //handleConnectMessage(msg)
    case msg: Disconnect => //handleDisconnectMessage(msg)
    case msg: MessageFromClient => //handleMessageFromClient(msg)
  }


}
