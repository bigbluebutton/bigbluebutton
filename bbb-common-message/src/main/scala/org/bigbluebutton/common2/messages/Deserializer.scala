package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.util.JsonUtil.fromJson

import scala.util.{Failure, Success, Try}


trait Deserializer {

  def toJBbbCommonEnvJsNodeMsg(json: String): Option[BbbCommonEnvJsNodeMsg] = {
    def convertFromJson(json: String): Try[BbbCommonEnvJsNodeMsg] = {
      for {
        msg <- Try(fromJson[BbbCommonEnvJsNodeMsg](json))
      } yield msg
    }

    convertFromJson(json) match {
      case Success(msg) => Some(msg)
      case Failure(ex) => println(s"************ Problem deserializing json: ${json}")
        println(s"************* Exception deserializing json: ${ex.getMessage}")
        None

    }
  }

  def toCreateMeetingReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[CreateMeetingReqMsg] = {
    def convertFromJson(json: String): Try[CreateMeetingReqMsg] = {
      for {
        msg <- Try(fromJson[CreateMeetingReqMsg](json))
      } yield msg
    }

    val json = JsonUtil.toJson(jsonNode)

    convertFromJson(json) match {
      case Success(msg) => Some(msg)
      case Failure(ex) => println(s"************ Problem deserializing json: ${json}")
        println(s"*********** Exception deserializing json: ${ex.getMessage}")
        None
    }
  }

}
