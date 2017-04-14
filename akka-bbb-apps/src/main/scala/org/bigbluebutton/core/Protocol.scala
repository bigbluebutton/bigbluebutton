package org.bigbluebutton.core

import spray.json.{ DefaultJsonProtocol, JsValue, JsString, DeserializationException, JsonFormat }
import org.bigbluebutton.core.api._

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

  implicit val breakoutRoomInPayloadFormat = jsonFormat3(BreakoutRoomInPayload)
  implicit val createBreakoutRoomsFormat = jsonFormat4(CreateBreakoutRooms)
  implicit val breakoutRoomsListMessageFormat = jsonFormat1(BreakoutRoomsListMessage)
  implicit val requestBreakoutJoinURLInMessageFormat = jsonFormat3(RequestBreakoutJoinURLInMessage)
  implicit val transferUserToMeetingRequestFormat = jsonFormat3(TransferUserToMeetingRequest)
  implicit val endBreakoutRoomsFormat = jsonFormat1(EndAllBreakoutRooms)
  implicit val inMsgHeaderFormat = jsonFormat1(InMessageHeader)
  implicit val outMsgHeaderFormat = jsonFormat1(OutMsgHeader)
  implicit val outMsgEnvelopeHeaderFormat = jsonFormat2(OutMsgEnvelopeHeader)
  implicit val createBreakoutRoomOutMsgPayloadFormat = jsonFormat11(CreateBreakoutRoomOutMsgPayload)
  implicit val createBreakoutRoomOutMsgEnvelopePayloadFormat = jsonFormat2(CreateBreakoutRoomOutMsgEnvelopePayload)
  implicit val createBreakoutRoomOutMsgEnvelopeFormat = jsonFormat2(CreateBreakoutRoomOutMsgEnvelope)
}
