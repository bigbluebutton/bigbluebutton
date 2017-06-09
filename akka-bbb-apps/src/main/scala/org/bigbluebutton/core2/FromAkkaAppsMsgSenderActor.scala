package org.bigbluebutton.core2

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages.BbbCommonEnvCoreMsg
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.MessageSender
import org.bigbluebutton.core.bus.BbbOutMessage

object FromAkkaAppsMsgSenderActor {
  def props(msgSender: MessageSender): Props = Props(classOf[FromAkkaAppsMsgSenderActor], msgSender)
}

class FromAkkaAppsMsgSenderActor(msgSender: MessageSender)
    extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: BbbCommonEnvCoreMsg => handleBbbCommonEnvCoreMsg(msg)
    case _ => log.warning("Cannot handle message ")
  }

  def handleBbbCommonEnvCoreMsg(msg: BbbCommonEnvCoreMsg): Unit = {
    val json = JsonUtil.toJson(msg)
    msgSender.send(fromAkkaAppsRedisChannel, json)
  }
}
