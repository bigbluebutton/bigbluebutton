package org.bigbluebutton.client

import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.messages.BbbServerMsg

trait RxJsonMsgHdlrTrait {

  def handleReceivedJsonMessage(msg: ReceivedJsonMessage): Unit = {
    val serverMsg = JsonUtil.fromJson[BbbServerMsg](msg.data)
    for {
      msgType <- serverMsg.envelope.routing.get("msgType")
    } yield {
      handleServerMsg(msgType, serverMsg)
    }
  }

  def handleServerMsg(msgType: String, msg: BbbServerMsg): Unit = {
    msgType match {
      case "direct" => handleDirectMessage(msg)
      case "broadcast" => handleBroadcastMessage(msg)
      //case "system" => handleSystemMessage(msg)
    }
  }

  def handleDirectMessage(msg: BbbServerMsg): Unit = {
    for {
      userId <- msg.envelope.routing.get("userId")
    } yield {
      //msgRouter.publish(MessageToClient(userId, msg))
    }
  }

  def handleBroadcastMessage(msg: BbbServerMsg): Unit = {
    for {
      meetingId <- msg.envelope.routing.get("meetingId")
    } yield {
      //msgRouter.publish(MessageToClient(meetingId, msg))
    }
  }

  //def handleSystemMessage(msg: BbbServerMsg): Unit {
  //
  //}
}
