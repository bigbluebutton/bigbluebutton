package org.bigbluebutton.client

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.client.bus.{BroadcastMsgToMeeting, DirectMsgToClient, SystemMsgToClient}
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.red5.client.messaging.{BroadcastToMeetingMsg, DirectToClientMsg}
import org.bigbluebutton.red5.client.messaging.{DisconnectAllClientsMessage, DisconnectClientMessage}
import org.bigbluebutton.common2.msgs.{DisconnectAllClientsSysMsg, DisconnectClientSysMsg}


object MsgToClientJsonActor {
  def props(msgToClientGW: MsgToClientGW): Props =
    Props(classOf[MsgToClientJsonActor], msgToClientGW)
}

class MsgToClientJsonActor(msgToClientGW: MsgToClientGW) extends Actor with ActorLogging {

  def receive = {
    case msg: BroadcastMsgToMeeting => handleBroadcastMsg(msg)
    case msg: DirectMsgToClient => handleDirectMsg(msg)
    case msg: SystemMsgToClient => handleSystemMsg(msg)
  }


  def handleBroadcastMsg(msg: BroadcastMsgToMeeting): Unit = {
    println("Received BroadcastMsgToMeeting " + msg)
    val meetingId = msg.meetingId
    val msgName = msg.data.envelope.name
    val json = JsonUtil.toJson(msg.data.core)

    val broadcast = new BroadcastToMeetingMsg(meetingId, msgName, json)
    msgToClientGW.broadcastToMeeting(broadcast)
  }

  def handleDirectMsg(msg: DirectMsgToClient): Unit = {
    println("Received DirectMsgToClient " + msg)
    val meetingId = msg.meetingId
    val connId = msg.connId
    val msgName = msg.data.envelope.name
    val json = JsonUtil.toJson(msg.data.core)

    val direct = new DirectToClientMsg(meetingId, connId, msgName, json)
    msgToClientGW.directToClient(direct)
  }

  def handleSystemMsg(msg: SystemMsgToClient): Unit = {
    println("Received SystemMsgToClient " + msg)
    val meetingId = msg.meetingId
    val userId = msg.userId

    msg.data.envelope.name match {
      case DisconnectAllClientsSysMsg.NAME =>
        val disconnect = new DisconnectAllClientsMessage(meetingId)
        msgToClientGW.systemMessage(disconnect)
      case DisconnectClientSysMsg.NAME =>
        val disconnect = new DisconnectClientMessage(meetingId, userId)
        msgToClientGW.systemMessage(disconnect)
    }
  }
}
