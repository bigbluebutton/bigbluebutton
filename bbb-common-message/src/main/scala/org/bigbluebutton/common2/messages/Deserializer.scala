package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.util.JsonUtil
import org.bigbluebutton.common2.util.JsonUtil.fromJson

import scala.util.{Failure, Success, Try}


trait Deserializer {

  def toBbbCoreMessageFromClient(json: String): (Option[BbbCoreMessageFromClient], String) = {
    def convertFromJson(json: String): Try[BbbCoreMessageFromClient] = {
      for {
        msg <- fromJson[BbbCoreMessageFromClient](json)
      } yield msg
    }

    convertFromJson(json) match {
      case Success(msg) => (Some(msg), "No Error.")
      case Failure(ex) => (None, ex.getMessage)
    }

  }

  def toBbbCommonMsg[V](jsonNode: JsonNode)(implicit m: Manifest[V]): (Option[V], String) = {
    val json = JsonUtil.toJson(jsonNode)
    val result = for {
      result <- fromJson[V](json)
    } yield result

    result match {
      case Success(msg) => (Some(msg), "No Error.")
      case Failure(ex) => (None, ex.getMessage)
    }
  }

  def toBbbCommonEnvJsNodeMsg(json: String): Try[BbbCommonEnvJsNodeMsg] = {
      for {
        msg <- fromJson[BbbCommonEnvJsNodeMsg](json)
      } yield msg
  }

  def toCreateMeetingReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[CreateMeetingReqMsg] = {
    def convertFromJson(json: String): Try[CreateMeetingReqMsg] = {
      for {
        msg <- fromJson[CreateMeetingReqMsg](json)
      } yield msg
    }

    val json = JsonUtil.toJson(jsonNode)

    val result = for {
      result <- convertFromJson(json)
    } yield result


    result match {
      case Success(msg) => Some(msg)
      case Failure(ex) => println(s"************ Problem deserializing json: ${jsonNode}")
        println(s"*********** Exception deserializing json: ${ex.getMessage}")
        None
    }
  }

  def toValidateAuthTokenReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[ValidateAuthTokenReqMsg] = {
    def convertFromJson(json: String): Try[ValidateAuthTokenReqMsg] = {
      for {
        msg <- fromJson[ValidateAuthTokenReqMsg](json)
      } yield msg
    }

    val json = JsonUtil.toJson(jsonNode)

    val result = for {
      result <- convertFromJson(json)
    } yield result


    result match {
      case Success(msg) => Some(msg)
      case Failure(ex) => println(s"************ Problem deserializing json: ${jsonNode}")
        println(s"*********** Exception deserializing json: ${ex.getMessage}")
        None
    }
  }

  def toMeetingCreatedEvtMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[MeetingCreatedEvtMsg] = {
    def convertFromJson(json: String): Try[MeetingCreatedEvtMsg] = {
      for {
        msg <- fromJson[MeetingCreatedEvtMsg](json)
      } yield msg
    }

    val json = JsonUtil.toJson(jsonNode)

    val result = for {
      result <- convertFromJson(json)
    } yield result

    result match {
      case Success(msg) => Some(msg)
      case Failure(ex) => println(s"************ Problem deserializing json: ${jsonNode}")
        println(s"*********** Exception deserializing json: ${ex.getMessage}")
        None
    }
  }

  def toRegisterUserReqMsg(envelope: BbbCoreEnvelope, jsonNode: JsonNode): Option[RegisterUserReqMsg] = {
    def convertFromJson(json: String): Try[RegisterUserReqMsg] = {
      for {
        msg <- fromJson[RegisterUserReqMsg](json)
      } yield msg
    }

    val json = JsonUtil.toJson(jsonNode)

    val result = for {
      result <- convertFromJson(json)
    } yield result

    result match {
      case Success(msg) => Some(msg)
      case Failure(ex) => println(s"************ Problem deserializing json: ${jsonNode}")
        println(s"*********** Exception deserializing json: ${ex.getMessage}")
        None
    }
  }
}
