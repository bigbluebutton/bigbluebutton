package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.client.bus._
import org.bigbluebutton.common2.messages.BbbServerMsg


object MeetingManagerActor {
  def props(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
            msgToClientEventBus: MsgToClientEventBus): Props =
    Props(classOf[MeetingManagerActor], msgToAkkaAppsEventBus, msgToClientEventBus)
}

class MeetingManagerActor(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
                          msgToClientEventBus: MsgToClientEventBus) extends Actor with ActorLogging {

  private val meetingMgr = new MeetingManager

  def receive = {
    case msg: ConnectMsg => handleConnectMsg(msg)
    case msg: DisconnectMsg => handleDisconnectMsg(msg)
    case msg: MsgFromClientMsg => handleMsgFromClientMsg(msg)
    case msg: BbbServerMsg => handleBbbServerMsg(msg)
      // TODO we should monitor meeting lifecycle so we can remove when meeting ends.
  }

  def createMeeting(meetingId: String): Meeting = {
    Meeting(meetingId, msgToAkkaAppsEventBus, msgToClientEventBus)
  }

  def handleConnectMsg(msg: ConnectMsg): Unit = {
     MeetingManager.findWithMeetingId(meetingMgr, msg.connInfo.meetingId) match {
       case Some(m) => m.actorRef forward(msg)
       case None =>
         val m = createMeeting(msg.connInfo.meetingId)
         MeetingManager.add(meetingMgr, m)
         m.actorRef forward(msg)
     }
  }

  def handleDisconnectMsg(msg: DisconnectMsg): Unit = {
    for {
      m <- MeetingManager.findWithMeetingId(meetingMgr, msg.connInfo.meetingId)
    } yield {
      m.actorRef forward(msg)
    }
  }

  def handleMsgFromClientMsg(msg: MsgFromClientMsg):Unit = {
    for {
      m <- MeetingManager.findWithMeetingId(meetingMgr, msg.connInfo.meetingId)
    } yield {
      m.actorRef forward(msg)
    }
  }

  def handleBbbServerMsg(msg: BbbServerMsg): Unit = {
    for {
      msgType <- msg.envelope.routing.get("msgType")
    } yield {
      handleServerMsg(msgType, msg)
    }
  }

  def handleServerMsg(msgType: String, msg: BbbServerMsg): Unit = {
    msgType match {
      case "direct" => handleDirectMessage(msg)
      case "broadcast" => handleBroadcastMessage(msg)
      case "system" => handleSystemMessage(msg)
    }
  }

  private def forwardToMeeting(msg: BbbServerMsg): Unit = {
    for {
      meetingId <- msg.envelope.routing.get("meetingId")
      m <- MeetingManager.findWithMeetingId(meetingMgr, meetingId)
    } yield {
      m.actorRef forward(msg)
    }
  }

  def handleDirectMessage(msg: BbbServerMsg): Unit = {
    // In case we want to handle specific message. We can do it here.
    forwardToMeeting(msg)
  }

  def handleBroadcastMessage(msg: BbbServerMsg): Unit = {
    // In case we want to handle specific message. We can do it here.
    forwardToMeeting(msg)
  }

  def handleSystemMessage(msg: BbbServerMsg): Unit = {
    // In case we want to handle specific message. We can do it here.
    forwardToMeeting(msg)
  }
}
