package org.bigbluebutton.client.meeting

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.client.bus.{ConnectMsg, DisconnectMsg, MsgFromClientMsg}
import org.bigbluebutton.common2.messages.BbbServerMsg
import org.bigbluebutton.common2.util.JsonUtil
import com.softwaremill.quicklens._

object UserActor {
  def props(userId: String): Props = Props(classOf[UserActor], userId)
}

class UserActor(val userId: String) extends Actor with ActorLogging {

  private val conns = new Connections

  def receive = {
    case msg: ConnectMsg => //handleConnect(msg)
    case msg: DisconnectMsg => //handleDisconnect(msg)
    case msg: MsgFromClientMsg => //handleMessageFromClient(msg)
    case msg: BbbServerMsg => handleBbbServerMsg(msg)
  }

  private def createConnection(id: String, sessionId: String, active: Boolean): Connection = {
    Connection(id, sessionId, active)
  }

  def handleConnectMsg(msg: ConnectMsg): Unit = {
    Connections.findWithId(conns, msg.connInfo.connId) match {
      case Some(m) => log.warning("Connect message on same connection id. " + JsonUtil.toJson(msg.connInfo))
      case None =>
        for {
          activeConn <- Connections.findActiveConnection(conns)
        } yield {
          Connections.setConnInactive(conns, activeConn)
        }
        val m = createConnection(msg.connInfo.connId, msg.connInfo.sessionId, true)
        Connections.add(conns, m)
    }
  }

  def handleDisconnectMsg(msg: DisconnectMsg): Unit = {
    for {
      m <- Connections.findWithId(conns, msg.connInfo.connId)
    } yield {
      Connections.remove(conns, m.connId)
    }
  }

  def handleMsgFromClientMsg(msg: MsgFromClientMsg):Unit = {
    for {
      m <- UsersManager.findWithId(userMgr, msg.connInfo.meetingId)
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

  private def forwardToUser(msg: BbbServerMsg): Unit = {
    for {
      userId <- msg.envelope.routing.get("userId")
      m <- UsersManager.findWithId(userMgr, userId)
    } yield {
      m.actorRef forward(msg)
    }
  }

  def handleDirectMessage(msg: BbbServerMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }

  def handleBroadcastMessage(msg: BbbServerMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }

  def handleSystemMessage(msg: BbbServerMsg): Unit = {
    // In case we want to handle specific messages. We can do it here.
    forwardToUser(msg)
  }
}


