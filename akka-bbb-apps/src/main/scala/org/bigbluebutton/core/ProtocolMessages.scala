package org.bigbluebutton.core

object MessageType extends Enumeration {
  type MessageType = Value
  val SYSTEM = Value("system")
  val BROADCAST = Value("broadcast")
  val DIRECT = Value("direct")
}

case class OutMessageEnvelopeHeader(messageType: MessageType.MessageType, destinationAddress: String)
case class OutMessageEnvelopePayload(payload: OutMessagePayload)
case class OutMessageEnvelope(header: OutMessageEnvelopeHeader, payload: OutMessageEnvelopePayload)
case class OutMessagePayload(header: OutMessageHeader, payload: OutMessage)
case class OutMessageHeader(name: String)

trait OutMessage

case class CreateBreakoutRoomRequest(meetingId: String, room: CreateBreakoutRoomOutPayload) extends OutMessage
case class CreateBreakoutRoomOutPayload(breakoutId: String, name: String, parentId: String,
                                        voiceConfId: String, durationInMinutes: Int, 
                                        moderatorPassword: String, viewerPassword: String,
                                        defaultPresentationUrl: String