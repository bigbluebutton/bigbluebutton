package org.bigbluebutton.client

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.client.bus.{BroadcastMsgToMeeting, DirectMsgToClient}
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.red5.client.messaging.{BroadcastToMeetingMsg, DirectToClientMsg}


object MsgToClientJsonActor {
  def props(msgToClientGW: MsgToClientGW): Props =
    Props(classOf[MsgToClientJsonActor], msgToClientGW)
}

class MsgToClientJsonActor(msgToClientGW: MsgToClientGW) extends Actor with ActorLogging {

  def receive = {
    case msg: BroadcastMsgToMeeting => handleBroadcastMsg(msg)
    case msg: DirectMsgToClient => handleDirectMsg(msg)
  }


  def handleBroadcastMsg(msg: BroadcastMsgToMeeting): Unit = {
    val meetingId = msg.meetingId
    val msgName = msg.data.envelope.name
    val json = JsonUtil.toJson(msg.data.jsonNode)

    val broadcast = new BroadcastToMeetingMsg(meetingId, msgName, json)
    msgToClientGW.broadcastToMeeting(broadcast)
  }

  def handleDirectMsg(msg: DirectMsgToClient): Unit = {
    val meetingId = msg.meetingId
    val connId = msg.connId
    val msgName = msg.data.envelope.name
    val json = JsonUtil.toJson(msg.data.jsonNode)

    val direct = new DirectToClientMsg(meetingId, connId, msgName, json)
    msgToClientGW.directToClient(direct)
  }
}
