package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.BbbMsgEvent
import scala.reflect.runtime.universe._

trait ReceivedJsonMsgDeserializer extends SystemConfiguration {
  this: ReceivedJsonMsgHandlerActor =>

  object JsonDeserializer extends Deserializer

  def deserialize[B <: BbbCoreMsg](jsonNode: JsonNode)(implicit tag: TypeTag[B]): Option[B] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[B](jsonNode)

    result match {
      case Some(msg) =>
        Some(msg.asInstanceOf[B])
      case None =>
        log.error("Failed to deserialize message " + error)
        None
    }
  }

  def send(channel: String, envelope: BbbCoreEnvelope, msg: BbbCoreMsg): Unit = {
    val event = BbbMsgEvent(channel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(event)

    val analyticsEvent = BbbMsgEvent(analyticsChannel, BbbCommonEnvCoreMsg(envelope, msg))
    publish(analyticsEvent)
  }

  def routeGenericMsg[B <: StandardMsg](envelope: BbbCoreEnvelope, jsonNode: JsonNode)(implicit tag: TypeTag[B]): Unit = {
    for {
      m <- deserialize[B](jsonNode)
    } yield {
      send(m.header.meetingId, envelope, m)
    }
  }

  def routeVoiceMsg[B <: VoiceStandardMsg](envelope: BbbCoreEnvelope, jsonNode: JsonNode)(implicit tag: TypeTag[B]): Unit = {
    for {
      m <- deserialize[B](jsonNode)
    } yield {
      send(m.header.voiceConf, envelope, m)
    }
  }
}
