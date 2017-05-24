package org.bigbluebutton.core.pubsub.senders

import akka.actor.{ Actor, ActorLogging, Props }
import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages.{ BbbCommonEnvCoreMsg, BbbCommonEnvJsNodeMsg, BbbCoreEnvelope, CreateMeetingReqMsg }
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.core.bus._

object ReceivedJsonMsgHandlerActor {
  def props(eventBus: BbbMsgRouterEventBus, incomingJsonMessageBus: IncomingJsonMessageBus): Props =
    Props(classOf[ReceivedJsonMsgHandlerActor], eventBus, incomingJsonMessageBus)
}

class ReceivedJsonMsgHandlerActor(
  val eventBus: BbbMsgRouterEventBus,
  val incomingJsonMessageBus: IncomingJsonMessageBus)
    extends Actor with ActorLogging with SystemConfiguration {

  def receive = {
    case msg: ReceivedJsonMessage =>
      val map = JsonUtil.fromJson[BbbCommonEnvJsNodeMsg](msg.data)
      println(map)
      decode(map.envelope, map.jsonNode)

    case _ => // do nothing
  }

  def decode(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    envelope.name match {
      case CreateMeetingReqMsg.NAME =>
        val body = JsonUtil.toJson(jsonNode)
        log.debug("CreateMeetingReqMsg toJson " + body)
        val cmr = JsonUtil.fromJson[CreateMeetingReqMsg](body)
        log.debug("CreateMeetingReqMsg fromJson " + cmr)
        val event = BbbMsgEvent(meetingManagerChannel, BbbCommonEnvCoreMsg(envelope, cmr))
        eventBus.publish(event)
      case _ => // do nothing
    }
  }

}
