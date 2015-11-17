package org.bigbluebutton.core

import spray.json.{ DefaultJsonProtocol, JsValue, JsString, DeserializationException, JsonFormat }
import org.bigbluebutton.core.api.BreakoutRoomInPayload
import org.bigbluebutton.core.api.CreateBreakoutRooms
import org.bigbluebutton.core.api.MessageHeader

object UserMessagesProtocol extends DefaultJsonProtocol {
  implicit val breakoutRoomInPayloadFormat = jsonFormat2(BreakoutRoomInPayload)
  implicit val CreateBreakoutRoomsFormat = jsonFormat3(CreateBreakoutRooms)
  implicit val msgHeaderFormat = jsonFormat1(MessageHeader)
}