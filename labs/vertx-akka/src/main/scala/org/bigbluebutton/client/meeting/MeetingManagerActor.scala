package org.bigbluebutton.client.meeting

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.client.bus._
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvJsNodeMsg, MessageTypes }

object MeetingManagerActor {
  def props(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
    msgToClientEventBus: MsgToClientEventBus): Props =
    Props(classOf[MeetingManagerActor], msgToAkkaAppsEventBus, msgToClientEventBus)
}

class MeetingManagerActor(msgToAkkaAppsEventBus: MsgToAkkaAppsEventBus,
  msgToClientEventBus: MsgToClientEventBus)
    extends Actor with ActorLogging {

  private val meetingMgr = new MeetingManager

  def receive = {
    case msg: ConnectMsg => handleConnectMsg(msg)
    case msg: DisconnectMsg => handleDisconnectMsg(msg)
    case msg: MsgFromClientMsg => handleMsgFromClientMsg(msg)
    case msg: BbbCommonEnvJsNodeMsg => handleBbbServerMsg(msg)
    // TODO we should monitor meeting lifecycle so we can remove when meeting ends.
  }

  def createMeeting(meetingId: String): Meeting = {
    Meeting(meetingId, msgToAkkaAppsEventBus, msgToClientEventBus)
  }

  def handleConnectMsg(msg: ConnectMsg): Unit = {
    //log.debug("****** Received handleConnectMsg " + msg)
    MeetingManager.findWithMeetingId(meetingMgr, msg.connInfo.meetingId) match {
      case Some(m) => m.actorRef forward (msg)
      case None =>
        val m = createMeeting(msg.connInfo.meetingId)
        MeetingManager.add(meetingMgr, m)
        m.actorRef forward (msg)
    }
  }

  def handleDisconnectMsg(msg: DisconnectMsg): Unit = {
    //log.debug("****** Received handleDisconnectMsg " + msg)
    for {
      m <- MeetingManager.findWithMeetingId(meetingMgr, msg.connInfo.meetingId)
    } yield {
      m.actorRef forward (msg)
    }
  }

  def handleMsgFromClientMsg(msg: MsgFromClientMsg): Unit = {
    //log.debug("**** MeetingManagerActor handleMsgFromClient " + msg.json)
    for {
      m <- MeetingManager.findWithMeetingId(meetingMgr, msg.connInfo.meetingId)
    } yield {
      m.actorRef forward (msg)
    }
  }

  def handleBbbServerMsg(msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingManagerActor handleBbbServerMsg " + msg.envelope.name)
    for {
      msgType <- msg.envelope.routing.get("msgType")
    } yield {
      handleServerMsg(msgType, msg)
    }
  }

  def handleServerMsg(msgType: String, msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingManagerActor handleServerMsg " + msg.envelope.name)
    msgType match {
      case MessageTypes.DIRECT => handleDirectMessage(msg)
      case MessageTypes.BROADCAST_TO_MEETING => handleBroadcastMessage(msg)
      case MessageTypes.SYSTEM => handleSystemMessage(msg)
    }
  }

  private def forwardToMeeting(msg: BbbCommonEnvJsNodeMsg): Unit = {
    msg.envelope.routing.get("meetingId") match {
      case Some(meetingId2) => //log.debug("**** MeetingManagerActor forwardToMeeting. Found " + meetingId2)
        MeetingManager.findWithMeetingId(meetingMgr, meetingId2) match {
          case Some(meetingId2) => //log.debug("**** MeetingManagerActor forwardToMeeting. Found " + meetingId2.meetingId)
          case None => //log.debug("**** MeetingManagerActor forwardToMeeting. Could not find meetingId")
        }
      case None => log.debug("**** MeetingManagerActor forwardToMeeting. Could not find meetingId")
    }

    for {
      meetingId <- msg.envelope.routing.get("meetingId")
      m <- MeetingManager.findWithMeetingId(meetingMgr, meetingId)
    } yield {
      //log.debug("**** MeetingManagerActor forwardToMeeting. " + m.meetingId)
      m.actorRef forward (msg)
    }
  }

  def handleDirectMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingManagerActor handleDirectMessage " + msg.envelope.name)
    // In case we want to handle specific message. We can do it here.
    forwardToMeeting(msg)
  }

  def handleBroadcastMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    // log.debug("**** MeetingManagerActor handleBroadcastMessage " + msg.envelope.name)
    // In case we want to handle specific message. We can do it here.
    forwardToMeeting(msg)
  }

  def handleSystemMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingManagerActor handleSystemMessage " + msg.envelope.name)
    // In case we want to handle specific message. We can do it here.
    forwardToMeeting(msg)
  }
}
