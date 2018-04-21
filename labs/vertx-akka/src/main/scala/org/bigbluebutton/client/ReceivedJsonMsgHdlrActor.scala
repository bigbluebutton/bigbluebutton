package org.bigbluebutton.client

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.client.bus.{ FromConnEventBus, JsonMsgFromAkkaApps, MsgFromAkkaApps, MsgFromConnBusMsg }
import org.bigbluebutton.common2.msgs.BbbCommonEnvJsNodeMsg
import org.bigbluebutton.common2.util.JsonUtil

import scala.util.{ Failure, Success }

object ReceivedJsonMsgHdlrActor {
  def props(connEventBus: FromConnEventBus): Props =
    Props(classOf[ReceivedJsonMsgHdlrActor], connEventBus)
}

class ReceivedJsonMsgHdlrActor(val connEventBus: FromConnEventBus)
    extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: JsonMsgFromAkkaApps => handleReceivedJsonMessage(msg)

    case _ => // do nothing
  }

  def handleReceivedJsonMessage(msg: JsonMsgFromAkkaApps): Unit = {
    //log.debug("****** Received JSON msg " + msg.data)
    JsonUtil.fromJson[BbbCommonEnvJsNodeMsg](msg.data) match {
      case Success(m) => connEventBus.publish(MsgFromConnBusMsg(fromAkkaAppsChannel, MsgFromAkkaApps(m)))
      case Failure(ex) => log.error("Failed to deserialize message " + ex)
    }

  }
}
