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
    case msg: BbbCommonEnvJsNodeMsg => handle(msg)
  }

  def handle(msg: BbbCommonEnvJsNodeMsg): Unit = {
    val json = JsonUtil.toJson(msg)
    val jsonMsg = JsonMsgToAkkaApps(toAkkaAppsRedisChannel, json)
    connEventBus.publish(MsgFromConnBusMsg(toAkkaAppsJsonChannel, jsonMsg))
  }

}
