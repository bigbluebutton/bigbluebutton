package org.bigbluebutton.client

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.client.bus._
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg
import org.bigbluebutton.common2.util.JsonUtil

object MsgToAkkaAppsToJsonActor {
  def props(connEventBus: InternalMessageBus): Props =
    Props(classOf[MsgToAkkaAppsToJsonActor], connEventBus)

}
class MsgToAkkaAppsToJsonActor(connEventBus: InternalMessageBus)
  extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: MsgToAkkaApps => handle(msg)
  }

  def handle(msg: MsgToAkkaApps): Unit = {
    println("**************** TO AKKA APPS MESSAGE ***************")
    val json = JsonUtil.toJson(msg.payload)
    val jsonMsg = JsonMsgToAkkaApps(toAkkaAppsRedisChannel, json)
    connEventBus.publish(MsgFromConnBusMsg(toAkkaAppsJsonChannel, jsonMsg))
  }

}
