package org.bigbluebutton.core

object MessageType extends Enumeration {
  type MessageType = Value
  val SYSTEM = Value("system")
  val BROADCAST = Value("broadcast")
  val DIRECT = Value("direct")
}

case class OutMsgHeader(name: String)
case class OutMsgEnvelopeHeader(messageType: MessageType.MessageType, destinationAddress: String)

trait OutMessage

case class CreateBreakoutRoomOutMsgEnvelope(header: OutMsgEnvelopeHeader,
  payload: CreateBreakoutRoomOutMsgEnvelopePayload)
case class CreateBreakoutRoomOutMsgEnvelopePayload(header: OutMsgHeader,
  payload: CreateBreakoutRoomOutMsgPayload)
case class CreateBreakoutRoomOutMsgPayload(breakoutId: String, name: String, parentId: String,
  voiceConfId: String, durationInMinutes: Int,
  moderatorPassword: String, viewerPassword: String,
  defaultPresentationUrl: String)