package org.bigbluebutton.core

import spray.json.{ DefaultJsonProtocol, JsValue, JsString, DeserializationException, JsonFormat }
import org.bigbluebutton.core.api.BreakoutRoomInPayload
import org.bigbluebutton.core.api.CreateBreakoutRooms
import org.bigbluebutton.core.api.InMessageHeader
import org.bigbluebutton.core.OutMessagePayload

object UserMessagesProtocol extends DefaultJsonProtocol {
/*  
  implicit object RoleJsonFormat extends JsonFormat[Role.RoleType] {
  	def write(obj: Role.RoleType): JsValue = JsString(obj.toString)
  	
  	def read(json: JsValue): Role.RoleType = json match {
  	    case JsString(str) => Role.withName(str)
  	    case _ => throw new DeserializationException("Enum string expected")
  	}
  }
*/
  
  implicit object MessageTypeFormat extends JsonFormat[MessageType.MessageType] {
  	def write(obj: MessageType.MessageType): JsValue = JsString(obj.toString)
  	
  	def read(json: JsValue): MessageType.MessageType = json match {
  	    case JsString(str) => MessageType.withName(str)
  	    case _ => throw new DeserializationException("Enum string expected")
  	}
  }
    
  implicit val breakoutRoomInPayloadFormat = jsonFormat2(BreakoutRoomInPayload)
  implicit val createBreakoutRoomsFormat = jsonFormat3(CreateBreakoutRooms)
  implicit val inMsgHeaderFormat = jsonFormat1(InMessageHeader)
  implicit val outMessageEnvelopeHeaderFormat = jsonFormat2(OutMessageEnvelopeHeader)
  implicit val outMessageEnvelopePayloadFormat = jsonFormat1(OutMessageEnvelopePayload)
  implicit val outMessagePayloadFormat = jsonFormat2(OutMessagePayload)
  implicit val outMessageHeaderFormat = jsonFormat1(OutMessageHeader)
  
case class OutMessageEnvelopePayload(payload: OutMessagePayload)
case class OutMessageEnvelope(header: OutMessageEnvelopeHeader, payload: OutMessageEnvelopePayload)
case class OutMessagePayload(header: OutMessageHeader, payload: OutMessage)
case class OutMessageHeader(name: String)
}