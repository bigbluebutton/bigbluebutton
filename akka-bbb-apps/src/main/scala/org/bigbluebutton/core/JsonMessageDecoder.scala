package org.bigbluebutton.core

import scala.util.{ Try, Success, Failure }
import spray.json.{ JsObject, JsonParser, DeserializationException }
import org.parboiled.errors.ParsingException
import org.bigbluebutton.core.api._
import org.bigbluebutton.messages._

object JsonMessageDecoder {
  import org.bigbluebutton.core.UserMessagesProtocol._
  import spray.json._

  def header(msg: JsObject): InMessageHeader = {
    msg.fields.get("header") match {
      case Some(header) =>
        header.convertTo[InMessageHeader]
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
      msg = InHeaderAndJsonPayload(header, payload)
      inmsg <- Try(convertMessage(msg))
    } yield inmsg
  }

  def decode(json: String): Option[InMessage] = {
    unmarshall(json) match {
      case Success(validMsg) => Some(validMsg)
      case Failure(ex) => None
    }
  }

  def convertMessage(msg: InHeaderAndJsonPayload): InMessage = {
    msg.header.name match {
      case GetBreakoutRoomsList.NAME => {
        msg.payload.convertTo[BreakoutRoomsListMessage]
      }
      case CreateBreakoutRoomsRequest.NAME => {
        msg.payload.convertTo[CreateBreakoutRooms]
      }
      case RequestBreakoutJoinURL.NAME => {
        msg.payload.convertTo[RequestBreakoutJoinURLInMessage]
      }
      case ListenInOnBreakout.NAME => {
        msg.payload.convertTo[TransferUserToMeetingRequest]
      }
      case EndAllBreakoutRoomsRequest.NAME => {
        msg.payload.convertTo[EndAllBreakoutRooms]
      }
      case _ => throw MessageProcessException("Cannot parse JSON message: [" + msg + "]")
    }
  }
}
