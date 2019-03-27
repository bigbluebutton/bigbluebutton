package org.bigbluebutton.common2.msgs

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.util.JsonUtil

import scala.reflect.ClassTag
import scala.reflect.runtime.universe._
import scala.util.{ Failure, Success, Try }

trait Deserializer {

  def toBbbCoreMessageFromClient(json: String): (Option[BbbCoreMessageFromClient], String) = {
    def convertFromJson(json: String): Try[BbbCoreMessageFromClient] = {
      for {
        msg <- JsonUtil.fromJsonToBbbCoreMessageFromClient(json)
      } yield msg
    }

    convertFromJson(json) match {
      case Success(msg) => (Some(msg), "No Error.")
      case Failure(ex)  => (None, ex.getMessage)
    }

  }

  def fromJson[T](json: String)(implicit tag: TypeTag[T]): Try[T] = {
    // https://stackoverflow.com/questions/23383814/is-it-possible-to-convert-a-typetag-to-a-manifest
    // typeTag to classTag
    implicit val cl = ClassTag[T](tag.mirror.runtimeClass(tag.tpe))

    // with an implicit classTag in scope, you can get a manifest
    manifest[T]

    for {
      result <- Try(JsonUtil.mapper.readValue[T](json))
    } yield result
  }

  def toBbbCommonMsg[V <: BbbCoreMsg](jsonNode: JsonNode)(implicit tag: TypeTag[V]): (Option[V], String) = {
    val json = JsonUtil.toJson(jsonNode)
    val result = for {
      result <- fromJson[V](json)
    } yield result

    result match {
      case Success(msg) => (Some(msg), "No Error.")
      case Failure(ex)  => (None, ex.getMessage)
    }
  }

  def toBbbCommonEnvJsNodeMsg(json: String): Try[BbbCommonEnvJsNodeMsg] = {
    for {
      msg <- JsonUtil.fromJsonToBbbCommonEnvJsNodeMsg(json)
    } yield msg
  }

}
