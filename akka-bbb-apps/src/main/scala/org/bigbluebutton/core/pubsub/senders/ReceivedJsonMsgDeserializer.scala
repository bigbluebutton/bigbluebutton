package org.bigbluebutton.core.pubsub.senders

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.SystemConfiguration
import org.bigbluebutton.common2.messages._

trait ReceivedJsonMsgDeserializer extends SystemConfiguration {
  this: ReceivedJsonMsgHandlerActor =>

  object JsonDeserializer extends Deserializer

  def deserialize[T](jsonNode: JsonNode)(implicit m: Manifest[T]): Option[T] = {
    val (result, error) = JsonDeserializer.toBbbCommonMsg[T](jsonNode)

    result match {
      case Some(msg) =>
        Some(msg.asInstanceOf[T])
      case None =>
        log.error("Failed to deserialize message. error: {} \n msg: ", error, jsonNode)
        None
    }
  }

}
