package org.bigbluebutton.common2.util

import com.fasterxml.jackson.databind.{ DeserializationFeature, JsonNode, ObjectMapper }
import com.fasterxml.jackson.module.scala.DefaultScalaModule
import com.fasterxml.jackson.module.scala.experimental.ScalaObjectMapper
import com.fasterxml.jackson.annotation.JsonInclude
import org.bigbluebutton.common2.msgs.{ BbbCommonEnvJsNodeMsg, BbbCoreMessageFromClient }

import scala.reflect.runtime.universe._
import scala.util.Try

object JsonUtil {
  val mapper = new ObjectMapper() with ScalaObjectMapper
  mapper.registerModule(DefaultScalaModule)
  mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true)
  mapper.configure(DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES, true)
  mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL)

  def toJson(value: Map[Symbol, Any]): String = {
    toJson(value map { case (k, v) => k.name -> v })
  }

  def toJson(value: Any): String = {
    mapper.writeValueAsString(value)
  }

  def toMap[V](json: String)(implicit m: Manifest[V]): Try[Map[String, V]] = {
    fromJson[Map[String, V]](json)
  }

  def fromJson[T](json: String)(implicit tag: Manifest[T]): Try[T] = {
    for {
      result <- Try(mapper.readValue[T](json))
    } yield result
  }

  def fromJsonToBbbCommonEnvJsNodeMsg(json: String): Try[BbbCommonEnvJsNodeMsg] = {
    for {
      result <- Try(mapper.readValue[BbbCommonEnvJsNodeMsg](json))
    } yield result
  }

  def fromJsonToBbbCoreMessageFromClient(json: String): Try[BbbCoreMessageFromClient] = {
    for {
      result <- Try(mapper.readValue[BbbCoreMessageFromClient](json))
    } yield result
  }

  def toJsonNode(json: String): Try[JsonNode] = {
    fromJson[JsonNode](json)
  }
}
