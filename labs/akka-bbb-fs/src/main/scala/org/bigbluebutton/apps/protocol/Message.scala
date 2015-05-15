package org.bigbluebutton.apps.protocol

import spray.json.DefaultJsonProtocol
import spray.json.JsValue
import spray.json.JsObject
import spray.json.JsonParser
import Message._

import org.parboiled.errors.ParsingException

object Message {
  case class Meeting(id: String, name: String, session: String)
  case class MessageHeader(name: String, timestamp: Long, meeting: Meeting)
  case class MessageEvent(header: MessageHeader, payload: JsValue)
}

object MessageHeaderJsonProtocol extends DefaultJsonProtocol {
  implicit val meetingFormat = jsonFormat3(Meeting)
  implicit val messageHeaderFormat = jsonFormat3(MessageHeader)
}

import MessageHeaderJsonProtocol._

object MessageHandler {
  def extractMessageHeader(msg: JsObject): Option[MessageHeader] = {
    msg.fields.get("header") match {
      case Some(header) => {
        val h = header.convertTo[MessageHeader]
        Some(h)
      }
      case None => None
    }
  }

  def extractPayload(msg: JsObject): Option[JsValue] = {
    msg.fields.get("payload")
  }

  def processMessage(msg: String): Option[JsObject] = {
    try {
      val msgObject = JsonParser(msg).asJsObject
      Some(msgObject)
    } catch {
      case e: ParsingException => None
    }
  }

  def forwardMessage(header: MessageHeader, payload: JsValue) {

  }

  def handleMessage(jsonMsg: String) {
    val jsonObj = processMessage(jsonMsg)
    if (jsonObj != None) {
      val msgObj = jsonObj get
      val header = extractMessageHeader(msgObj)
      val payload = extractPayload(msgObj)

      if (header != None && payload != None) {
        forwardMessage(header get, payload get)
      }
    }
  }
}