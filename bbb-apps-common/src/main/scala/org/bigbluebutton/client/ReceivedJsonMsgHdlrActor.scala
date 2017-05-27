package org.bigbluebutton.client

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.client.bus.{JsonMsgFromAkkaApps, MsgFromAkkaApps, MsgFromAkkaAppsEventBus}
import org.bigbluebutton.common2.messages.BbbCommonEnvJsNodeMsg
import org.bigbluebutton.common2.util.JsonUtil


object ReceivedJsonMsgHdlrActor {
  def props(msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], msgFromAkkaAppsEventBus)
}

class ReceivedJsonMsgHdlrActor(val msgFromAkkaAppsEventBus: MsgFromAkkaAppsEventBus)
  extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: JsonMsgFromAkkaApps => handleReceivedJsonMessage(msg)


    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: JsonMsgFromAkkaApps): Unit = {
    println("****** Received JSON msg " + msg.data)
    val serverMsg = JsonUtil.fromJson[BbbCommonEnvJsNodeMsg](msg.data)
    msgFromAkkaAppsEventBus.publish(MsgFromAkkaApps(fromAkkaAppsChannel, serverMsg))
  }
}
