package org.bigbluebutton.core

import spray.json.{ DefaultJsonProtocol, JsValue, JsString, DeserializationException, JsonFormat }
import org.bigbluebutton.core.api.BreakoutRoomInPayload
import org.bigbluebutton.core.api.CreateBreakoutRooms
import org.bigbluebutton.core.api.InMessageHeader

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

  implicit object MessageTypeFormat extends JsonFormat[MessageType.FooType] {
    def write(obj: MessageType.FooType): JsValue = JsString(obj.toString)

    def read(json: JsValue): MessageType.FooType = json match {
      case JsString(str) => MessageType.withName(str)
      case _ => throw new DeserializationException("Enum string expected")
    }
  }

  implicit val breakoutRoomInPayloadFormat = jsonFormat2(BreakoutRoomInPayload)
  implicit val createBreakoutRoomsFormat = jsonFormat3(CreateBreakoutRooms)
  implicit val inMsgHeaderFormat = jsonFormat1(InMessageHeader)
  implicit val outMsgHeaderFormat = jsonFormat1(OutMsgHeader)
  implicit val outMsgEnvelopeHeaderFormat = jsonFormat2(OutMsgEnvelopeHeader)
  implicit val createBreakoutRoomOutMsgPayloadFormat = jsonFormat8(CreateBreakoutRoomOutMsgPayload)
  implicit val createBreakoutRoomOutMsgEnvelopePayloadFormat = jsonFormat2(CreateBreakoutRoomOutMsgEnvelopePayload)
  implicit val createBreakoutRoomOutMsgEnvelopeFormat = jsonFormat2(CreateBreakoutRoomOutMsgEnvelope)

}