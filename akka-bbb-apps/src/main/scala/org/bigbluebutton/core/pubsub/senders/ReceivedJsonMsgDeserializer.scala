package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.bus.BbbMsgEvent

trait ReceivedJsonMsgDeserializer extends SystemConfiguration {
  this: ReceivedJsonMsgHandlerActor =>

  object JsonDeserializer extends Deserializer

  def deserializeFoo[T](jsonNode: JsonNode)(implicit m: Manifest[T]): Option[T] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[T](jsonNode)

    result match {
      case Some(msg) =>
        Some(msg.asInstanceOf[T])
      case None =>
        log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
        None
    }
  }

  def deserialize[B <: BbbCoreMsg](jsonNode: JsonNode)(implicit tag: Manifest[B]): Option[B] = {
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
  }

  def routeGenericMsg[B <: StandardMsg](envelope: BbbCoreEnvelope, jsonNode: JsonNode)(implicit tag: Manifest[B]): Unit = {
    for {
      m <- deserialize[B](jsonNode)
    } yield {
      send(m.header.meetingId, envelope, m)
    }
  }
}
