package org.bigbluebutton.client

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.client.bus.{ JsonMsgFromAkkaApps, MsgFromAkkaApps, MsgFromAkkaAppsEventBus }
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg
import org.bigbluebutton.common2.util.JsonUtil

import scala.util.{ Failure, Success }

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
    //log.debug("****** Received JSON msg " + msg.data)
    JsonUtil.fromJson[BbbCommonEnvJsNodeMsg](msg.data) match {
      case Success(m) => msgFromAkkaAppsEventBus.publish(MsgFromAkkaApps(fromAkkaAppsChannel, m))
      case Failure(ex) => log.error("Failed to deserialize message " + ex)
    }

  }
}
