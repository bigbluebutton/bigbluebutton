package org.bigbluebutton.transcode

import org.bigbluebutton.common2.msgs._

import com.fasterxml.jackson.databind.JsonNode
import scala.collection.JavaConverters

trait JsonMsgDeserializer {
  this: JsonMsgHdlrActor =>

  object JsonDeserializer extends Deserializer

  def routeStartProbingSysReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[StartProbingSysReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[StartProbingSysReqMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[StartProbingSysReqMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }
    for {
      m <- deserialize(jsonNode)
    } yield {
      inGW.startProbing(m.header.meetingId, m.body.transcoderId, JavaConverters.mapAsJavaMap(m.body.params))
    }
  }

  def routeStartTranscoderSysReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[StartTranscoderSysReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[StartTranscoderSysReqMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[StartTranscoderSysReqMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }
    for {
      m <- deserialize(jsonNode)
    } yield {
      inGW.startTranscoder(m.header.meetingId, m.body.transcoderId, JavaConverters.mapAsJavaMap(m.body.params))
    }
  }

  def routeStopTranscoderSysReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[StopTranscoderSysReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[StopTranscoderSysReqMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[StopTranscoderSysReqMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }
    for {
      m <- deserialize(jsonNode)
    } yield {
      inGW.stopTranscoder(m.header.meetingId, m.body.transcoderId)
    }
  }

  def routeUpdateTranscoderSysReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[UpdateTranscoderSysReqMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[UpdateTranscoderSysReqMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[UpdateTranscoderSysReqMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }
    for {
      m <- deserialize(jsonNode)
    } yield {
      inGW.updateTranscoder(m.header.meetingId, m.body.transcoderId, JavaConverters.mapAsJavaMap(m.body.params))
    }
  }

  def routeStopMeetingTranscodersSysCmdMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Unit = {
    def deserialize(jsonNode: JsonNode): Option[StopMeetingTranscodersSysCmdMsg] = {
      val (result, error) = JsonDeserializer.toBbbCommonMsg[StopMeetingTranscodersSysCmdMsg](jsonNode)
      result match {
        case Some(msg) => Some(msg.asInstanceOf[StopMeetingTranscodersSysCmdMsg])
        case None =>
          log.error("Failed to deserialize message: error: {} \n msg: {}", error, jsonNode)
          None
      }
    }
    for {
      m <- deserialize(jsonNode)
    } yield {
      inGW.stopMeetingTranscoders(m.header.meetingId)
    }
  }
}
