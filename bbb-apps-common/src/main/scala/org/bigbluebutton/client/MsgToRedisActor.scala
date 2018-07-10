package org.bigbluebutton.client

import akka.actor.{Actor, ActorLogging, Props}
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.client.endpoint.redis.MessageSender

object MsgToRedisActor {
  def props(msgSender: MessageSender): Props =
    Props(classOf[MsgToRedisActor], msgSender)

}
class MsgToRedisActor(msgSender: MessageSender)
  extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: BbbCommonEnvJsNodeMsg => handle(msg)
  }

  def handle(msg: BbbCommonEnvJsNodeMsg): Unit = {
    val json = JsonUtil.toJson(msg)
    msgSender.send(toAkkaAppsRedisChannel, json)
  }

}
