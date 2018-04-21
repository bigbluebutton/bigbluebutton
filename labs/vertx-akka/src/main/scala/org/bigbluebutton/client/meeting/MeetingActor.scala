package org.bigbluebutton.client.meeting

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.client.SystemConfiguration
import org.bigbluebutton.client.bus._
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvJsNodeMsg, DisconnectAllClientsSysMsg, MessageTypes }

object MeetingActor {
  def props(meetingId: String, connEventBus: FromConnEventBus): Props =
    Props(classOf[MeetingActor], meetingId, connEventBus)
}

class MeetingActor(val meetingId: String, connEventBus: FromConnEventBus)
    extends Actor with ActorLogging
    with SystemConfiguration {

  private val userMgr = new UsersManager

  def receive = {
    case msg: ConnectMsg => handleConnectMsg(msg)
    case msg: DisconnectMsg => handleDisconnectMsg(msg)
    case msg: MsgFromClientMsg => handleMsgFromClientMsg(msg)
    case msg: BbbCommonEnvJsNodeMsg => handleBbbServerMsg(msg)
    // TODO: Should keep track of user lifecycle so we can remove when user leaves the meeting.
  }

  private def createUser(id: String): User = {
    User(id, connEventBus, meetingId)
  }

  def handleConnectMsg(msg: ConnectMsg): Unit = {
    //log.debug("**** MeetingActor handleConnectMsg " + msg.connInfo.meetingId)
    UsersManager.findWithId(userMgr, msg.connInfo.userId) match {
      case Some(m) => m.actorRef forward (msg)
      case None =>
        val m = createUser(msg.connInfo.userId)
        UsersManager.add(userMgr, m)
        m.actorRef forward (msg)
    }
  }

  def handleDisconnectMsg(msg: DisconnectMsg): Unit = {
    //log.debug("**** MeetingActor handleDisconnectMsg " + msg.connInfo.meetingId)
    for {
      m <- UsersManager.findWithId(userMgr, msg.connInfo.userId)
    } yield {
      m.actorRef forward (msg)
    }
  }

  def handleMsgFromClientMsg(msg: MsgFromClientMsg): Unit = {
    //log.debug("**** MeetingActor handleMsgFromClient " + msg.json)
    for {
      m <- UsersManager.findWithId(userMgr, msg.connInfo.userId)
    } yield {
      m.actorRef forward (msg)
    }
  }

  def handleBbbServerMsg(msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingActor handleBbbServerMsg " + msg.envelope.name)
    for {
      msgType <- msg.envelope.routing.get("msgType")
    } yield {
      handleServerMsg(msgType, msg)
    }
  }

  def handleServerMsg(msgType: String, msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingActor handleServerMsg " + msg.envelope.name)
    msgType match {
      case MessageTypes.DIRECT => handleDirectMessage(msg)
      case MessageTypes.BROADCAST_TO_MEETING => handleBroadcastMessage(msg)
      case MessageTypes.SYSTEM => handleSystemMessage(msg)
    }
  }

  private def forwardToUser(msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingActor forwardToUser " + msg.envelope.name)
    for {
      userId <- msg.envelope.routing.get("userId")
      m <- UsersManager.findWithId(userMgr, userId)
    } yield {
      //log.debug("**** MeetingActor forwardToUser " + m.userId)
      m.actorRef forward (msg)
    }
  }

  def handleDirectMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    //log.debug("**** MeetingActor handleDirectMessage " + msg.envelope.name)
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }

  def handleBroadcastMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    connEventBus.publish(MsgFromConnBusMsg(toClientChannel, BroadcastMsgToMeeting(meetingId, msg)))
  }

  def handleSystemMessage(msg: BbbCommonEnvJsNodeMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    msg.envelope.name match {
      case DisconnectAllClientsSysMsg.NAME =>
        connEventBus.publish(MsgFromConnBusMsg(toClientChannel, DisconnectAllMeetingClientsMsg(meetingId)))
      case _ => forwardToUser(msg)
    }

  }
}
