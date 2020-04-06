package org.bigbluebutton.common2.msgs

import com.fasterxml.jackson.databind.JsonNode

object MessageTypes {
  val DIRECT = "DIRECT"
  val BROADCAST_TO_MEETING = "BROADCAST_TO_MEETING" // Send to all clients in the meeting
  val BROADCAST_TO_ALL = "BROADCAST_TO_ALL" // Send to all clients
  val SYSTEM = "SYSTEM"
}

trait BbbCoreMsg

sealed trait BbbCommonMsg

trait BbbCoreHeader

trait StandardMsg extends BbbCoreMsg {
  def header: BbbClientMsgHeader
}

trait StandardSysMsg extends BbbCoreMsg {
  def header: BbbClientMsgHeader
}

case class BbbCoreEnvelope(name: String, routing: collection.immutable.Map[String, String], timestamp: Long)
object BbbCoreEnvelope {
  def apply(name: String, routing: collection.immutable.Map[String, String]): BbbCoreEnvelope = {
    BbbCoreEnvelope(name, routing, System.currentTimeMillis())
  }
}

case class BbbCommonEnvCoreMsg(envelope: BbbCoreEnvelope, core: BbbCoreMsg) extends BbbCommonMsg

case class BbbCommonEnvJsNodeMsg(envelope: BbbCoreEnvelope, core: JsonNode) extends BbbCommonMsg

case class BbbCoreBaseHeader(name: String) extends BbbCoreHeader

case class BbbCoreHeaderWithMeetingId(name: String, meetingId: String) extends BbbCoreHeader

case class BbbClientMsgHeader(name: String, meetingId: String, userId: String) extends BbbCoreHeader

case class BbbCoreMessageFromClient(header: BbbClientMsgHeader, body: JsonNode)

case class BbbCoreHeaderBody(header: BbbCoreHeader, body: JsonNode)

