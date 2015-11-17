package org.bigbluebutton.core

import scala.util.{ Try, Success, Failure }
import spray.json.{ JsObject, JsonParser, DeserializationException }
import org.parboiled.errors.ParsingException
import org.bigbluebutton.core.api._
import org.bigbluebutton.messages.CreateBreakoutRoomsRequest

object JsonMessageDecoder {
  import org.bigbluebutton.core.UserMessagesProtocol._
  import spray.json._

  def header(msg: JsObject): MessageHeader = {
    msg.fields.get("header") match {
      case Some(header) =>
        header.convertTo[MessageHeader]
      case None =>
        throw MessageProcessException("Cannot get payload information: [" + msg + "]")
    }
  }

  def payload(msg: JsObject): JsObject = {
    msg.fields.get("payload") match {
      case Some(payload) =>
        payload.asJsObject
      case None =>
        throw MessageProcessException("Cannot get payload information: [" + msg + "]")
    }
  }

  def toJsObject(msg: String): JsObject = {
    try {
      JsonParser(msg).asJsObject
    } catch {
      case e: ParsingException => {
        throw MessageProcessException("Cannot parse JSON message: [" + msg + "]")
      }
    }
  }

  def unmarshall(jsonMsg: String): Try[InMessage] = {
    for {
      jsonObj <- Try(toJsObject(jsonMsg))
      header <- Try(header(jsonObj))
      payload <- Try(payload(jsonObj))
      msg = HeaderAndJsonPayload(header, payload)
      inmsg <- Try(convertMessage(msg))
    } yield inmsg
  }

  def decode(json: String): Option[InMessage] = {
    unmarshall(json) match {
      case Success(validMsg) => Some(validMsg)
      case Failure(ex) => None
    }
  }

  def convertMessage(msg: HeaderAndJsonPayload): InMessage = {
    msg.header.name match {
      case CreateBreakoutRoomsRequest.NAME => {
        msg.payload.convertTo[CreateBreakoutRooms]
      }
      case _ => throw MessageProcessException("Cannot parse JSON message: [" + msg + "]")
    }
  }
}