package org.bigbluebutton.common2.messages

import com.fasterxml.jackson.databind.JsonNode
import org.bigbluebutton.common2.domain._
import org.bigbluebutton.common2.messages.MessageBody._

object MessageTypes {
  val DIRECT = "DIRECT"
  val BROADCAST_TO_MEETING = "BROADCAST_TO_MEETING" // Send to all clients in the meeting
  val BROADCAST_TO_ALL = "BROADCAST_TO_ALL" // Send to all clients
  val SYSTEM = "SYSTEM"
}

// seal trait to force all classes that extends this trait to be defined in this file.
trait BbbCoreMsg
sealed trait BbbCommonMsg
trait BbbCoreHeader

trait StandardMsg extends BbbCoreMsg { def header: BbbClientMsgHeader }

case class RoutingEnvelope(msgType: String, meetingId: String, userId: String)
case class BbbMsgToClientEnvelope(name: String, routing: RoutingEnvelope)
case class BbbCoreEnvelope(name: String, routing: collection.immutable.Map[String, String])
case class BbbCommonEnvCoreMsg(envelope: BbbCoreEnvelope, core: BbbCoreMsg) extends BbbCommonMsg
case class BbbCommonEnvJsNodeMsg(envelope: BbbCoreEnvelope, core: JsonNode) extends BbbCommonMsg

case class BbbCoreBaseHeader(name: String) extends BbbCoreHeader
case class BbbCoreHeaderWithMeetingId(name: String, meetingId: String) extends BbbCoreHeader
case class BbbClientMsgHeader(name: String, meetingId: String, userId: String) extends BbbCoreHeader

case class BbbCoreMessageFromClient(header: BbbClientMsgHeader, body: JsonNode)

case class BbbCoreHeaderBody(header: BbbCoreHeader, body: JsonNode)


/** Presentation Messages */
object SetCurrentPresentationPubMsg { val NAME = "SetCurrentPresentationPubMsg"}
case class SetCurrentPresentationPubMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationPubMsgBody) extends StandardMsg

object GetPresentationInfoReqMsg { val NAME = "GetPresentationInfoReqMsg"}
case class GetPresentationInfoReqMsg(header: BbbClientMsgHeader) extends StandardMsg

object SetCurrentPagePubMsg { val NAME = "SetCurrentPagePubMsg"}
case class SetCurrentPagePubMsg(header: BbbClientMsgHeader, body: SetCurrentPagePubMsgBody) extends StandardMsg

object ResizeAndMovePagePubMsg { val NAME = "ResizeAndMovePagePubMsg"}
case class ResizeAndMovePagePubMsg(header: BbbClientMsgHeader, body: ResizeAndMovePagePubMsgBody) extends StandardMsg

object RemovePresentationPubMsg { val NAME = "RemovePresentationPubMsg"}
case class RemovePresentationPubMsg(header: BbbClientMsgHeader, body: RemovePresentationPubMsgBody) extends StandardMsg

object PreuploadedPresentationsPubMsg { val NAME = "PreuploadedPresentationsPubMsg"}
case class PreuploadedPresentationsPubMsg(header: BbbClientMsgHeader, body: PreuploadedPresentationsPubMsgBody) extends StandardMsg

object PresentationConversionUpdatePubMsg { val NAME = "PresentationConversionUpdatePubMsg"}
case class PresentationConversionUpdatePubMsg(header: BbbClientMsgHeader, body: PresentationConversionUpdatePubMsgBody) extends StandardMsg

object PresentationPageCountErrorPubMsg { val NAME = "PresentationPageCountErrorPubMsg"}
case class PresentationPageCountErrorPubMsg(header: BbbClientMsgHeader, body: PresentationPageCountErrorPubMsgBody) extends StandardMsg

object PresentationPageGeneratedPubMsg { val NAME = "PresentationPageGeneratedPubMsg"}
case class PresentationPageGeneratedPubMsg(header: BbbClientMsgHeader, body: PresentationPageGeneratedPubMsgBody) extends StandardMsg

object PresentationConversionCompletedPubMsg { val NAME = "PresentationConversionCompletedPubMsg"}
case class PresentationConversionCompletedPubMsg(header: BbbClientMsgHeader, body: PresentationConversionCompletedPubMsgBody) extends StandardMsg


/** Presentation Messages */
object NewPresentationEvtMsg { val NAME = "NewPresentationEvtMsg"}
case class NewPresentationEvtMsg(header: BbbClientMsgHeader, body: NewPresentationEvtMsgBody) extends BbbCoreMsg

object SetCurrentPresentationEvtMsg { val NAME = "SetCurrentPresentationEvtMsg"}
case class SetCurrentPresentationEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPresentationEvtMsgBody) extends BbbCoreMsg

object GetPresentationInfoRespMsg { val NAME = "GetPresentationInfoRespMsg"}
case class GetPresentationInfoRespMsg(header: BbbClientMsgHeader, body: GetPresentationInfoRespMsgBody) extends BbbCoreMsg

object SetCurrentPageEvtMsg { val NAME = "SetCurrentPageEvtMsg"}
case class SetCurrentPageEvtMsg(header: BbbClientMsgHeader, body: SetCurrentPageEvtMsgBody) extends BbbCoreMsg

object ResizeAndMovePageEvtMsg { val NAME = "ResizeAndMovePageEvtMsg"}
case class ResizeAndMovePageEvtMsg(header: BbbClientMsgHeader, body: ResizeAndMovePageEvtMsgBody) extends BbbCoreMsg

object RemovePresentationEvtMsg { val NAME = "RemovePresentationEvtMsg"}
case class RemovePresentationEvtMsg(header: BbbClientMsgHeader, body: RemovePresentationEvtMsgBody) extends BbbCoreMsg

object PresentationConversionUpdateEvtMsg { val NAME = "PresentationConversionUpdateEvtMsg"}
case class PresentationConversionUpdateEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionUpdateEvtMsgBody) extends BbbCoreMsg

object PresentationPageCountErrorEvtMsg { val NAME = "PresentationPageCountErrorEvtMsg"}
case class PresentationPageCountErrorEvtMsg(header: BbbClientMsgHeader, body: PresentationPageCountErrorEvtMsgBody) extends BbbCoreMsg

object PresentationPageGeneratedEvtMsg { val NAME = "PresentationPageGeneratedEvtMsg"}
case class PresentationPageGeneratedEvtMsg(header: BbbClientMsgHeader, body: PresentationPageGeneratedEvtMsgBody) extends BbbCoreMsg

object PresentationConversionCompletedEvtMsg { val NAME = "PresentationConversionCompletedEvtMsg"}
case class PresentationConversionCompletedEvtMsg(header: BbbClientMsgHeader, body: PresentationConversionCompletedEvtMsgBody) extends BbbCoreMsg


/** System Messages **/
case class AkkaAppsCheckAliveReqBody(timestamp: Long)
case class AkkaAppsCheckAliveReqMsg(header: BbbCoreHeader, body: AkkaAppsCheckAliveReqBody)
case class AkkaAppsCheckAliveReq(envelope: BbbCoreEnvelope, msg: AkkaAppsCheckAliveReqMsg) extends BbbCoreMsg
