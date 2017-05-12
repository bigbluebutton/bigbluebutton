package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import org.bigbluebutton.common2.messages.CreateMeetingReq
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.bus._

object ReceivedJsonMsgHandlerActor {
  def props(eventBus: BbbMsgRouterEventBus, incomingJsonMessageBus: IncomingJsonMessageBus): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHandlerActor(
  val eventBus: BbbMsgRouterEventBus,
  val incomingJsonMessageBus: IncomingJsonMessageBus)
    extends Actor with ActorLogging {

  def receive = {
    case msg: ReceivedJsonMessage =>
      val map = JsonUtil.toMap[Map[String, Any]](msg.data)
      println(map)

      for {
        header <- map.get("header")
        name <- header.get("name")
      } yield {
        println(s"***** msg name = ${name}")
        decode(name.toString, msg.data)
      }

    case _ => // do nothing
  }

  def decode(name: String, json: String): Unit = {
    name match {
      case "CreateMeetingReq" =>
        val cmr = JsonUtil.fromJson[CreateMeetingReq](json)
        val msg = BbbMsgEvent("to-meeting-manager", cmr)
        eventBus.publish(msg)
        println("CMR= " + cmr)
      case _ => // do nothing
    }
  }

}
