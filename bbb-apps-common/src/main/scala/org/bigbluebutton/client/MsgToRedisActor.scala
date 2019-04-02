package org.bigbluebutton.client

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.msgs.LookUpUserReqMsg
import org.bigbluebutton.common2.redis.MessageSender

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

    msg.envelope.name match {
      case LookUpUserReqMsg.NAME => msgSender.send(toThirdPartyRedisChannel, json)
      case _                     => msgSender.send(toAkkaAppsRedisChannel, json)
    }
  }
}
