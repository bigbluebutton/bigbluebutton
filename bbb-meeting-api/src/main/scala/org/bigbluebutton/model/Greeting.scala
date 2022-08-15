package org.bigbluebutton.model

import io.circe.{Decoder, Encoder, Error, Json}
import io.circe.parser.decode
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import io.circe.syntax._

case class Greeting(text: String, language: String) {
  override def toString: String = text
  def toJson: Json = this.asJson
}

object Greeting {
  implicit val decodeGreeting: Decoder[Greeting] = deriveDecoder[Greeting]
  implicit val encodeGreeting: Encoder[Greeting] = deriveEncoder[Greeting]

  def fromSalutation(obj: Salutation): Greeting = Greeting(obj.toString, obj.lang.toString)
  def fromJson(string: String): Either[Error, Greeting] = decode[Greeting](string)
  def asJson(greeting: Greeting): Json = greeting.asJson
  def asString(greeting: Greeting): String = greeting.text
}
