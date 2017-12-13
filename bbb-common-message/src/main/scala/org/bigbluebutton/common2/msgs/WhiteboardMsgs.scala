package org.bigbluebutton.common2.msgs

case class AnnotationVO(id: String, status: String, annotationType: String,
                        annotationInfo: scala.collection.immutable.Map[String, Any], wbId: String, userId: String, position: Int)

object ClientToServerLatencyTracerMsg { val NAME = "ClientToServerLatencyTracerMsg" }
case class ClientToServerLatencyTracerMsg(header: BbbClientMsgHeader, body: ClientToServerLatencyTracerMsgBody) extends StandardMsg
case class ClientToServerLatencyTracerMsgBody(timestampUTC: Long, rtt: Long,  senderId: String)

object ServerToClientLatencyTracerMsg { val NAME = "ServerToClientLatencyTracerMsg" }
case class ServerToClientLatencyTracerMsg(header: BbbClientMsgHeader, body: ServerToClientLatencyTracerMsgBody) extends BbbCoreMsg
case class ServerToClientLatencyTracerMsgBody(timestampUTC: Long, rtt: Long, senderId: String)

object DoLatencyTracerMsg { val NAME = "DoLatencyTracerMsg" }
case class DoLatencyTracerMsg(header: BbbClientMsgHeader, body: DoLatencyTracerMsgBody) extends BbbCoreMsg
case class DoLatencyTracerMsgBody(timestampUTC: Long)

object ClearWhiteboardEvtMsg { val NAME = "ClearWhiteboardEvtMsg" }
case class ClearWhiteboardEvtMsg(header: BbbClientMsgHeader, body: ClearWhiteboardEvtMsgBody) extends BbbCoreMsg
case class ClearWhiteboardEvtMsgBody(whiteboardId: String, userId: String, fullClear: Boolean)

object ClearWhiteboardPubMsg { val NAME = "ClearWhiteboardPubMsg" }
case class ClearWhiteboardPubMsg(header: BbbClientMsgHeader, body: ClearWhiteboardPubMsgBody) extends StandardMsg
case class ClearWhiteboardPubMsgBody(whiteboardId: String)

object GetWhiteboardAnnotationsReqMsg { val NAME = "GetWhiteboardAnnotationsReqMsg" }
case class GetWhiteboardAnnotationsReqMsg(header: BbbClientMsgHeader, body: GetWhiteboardAnnotationsReqMsgBody) extends StandardMsg
case class GetWhiteboardAnnotationsReqMsgBody(whiteboardId: String)

object GetWhiteboardAnnotationsRespMsg { val NAME = "GetWhiteboardAnnotationsRespMsg" }
case class GetWhiteboardAnnotationsRespMsg(header: BbbClientMsgHeader, body: GetWhiteboardAnnotationsRespMsgBody) extends BbbCoreMsg
case class GetWhiteboardAnnotationsRespMsgBody(whiteboardId: String, annotations: Array[AnnotationVO], multiUser: Boolean)

object ModifyWhiteboardAccessEvtMsg { val NAME = "ModifyWhiteboardAccessEvtMsg" }
case class ModifyWhiteboardAccessEvtMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAccessEvtMsgBody) extends BbbCoreMsg
case class ModifyWhiteboardAccessEvtMsgBody(whiteboardId: String, multiUser: Boolean)

object ModifyWhiteboardAccessPubMsg { val NAME = "ModifyWhiteboardAccessPubMsg" }
case class ModifyWhiteboardAccessPubMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAccessPubMsgBody) extends StandardMsg
case class ModifyWhiteboardAccessPubMsgBody(whiteboardId: String, multiUser: Boolean)

object SendCursorPositionEvtMsg { val NAME = "SendCursorPositionEvtMsg" }
case class SendCursorPositionEvtMsg(header: BbbClientMsgHeader, body: SendCursorPositionEvtMsgBody) extends BbbCoreMsg
case class SendCursorPositionEvtMsgBody(whiteboardId: String, xPercent: Double, yPercent: Double)

object SendCursorPositionPubMsg { val NAME = "SendCursorPositionPubMsg" }
case class SendCursorPositionPubMsg(header: BbbClientMsgHeader, body: SendCursorPositionPubMsgBody) extends StandardMsg
case class SendCursorPositionPubMsgBody(whiteboardId: String, xPercent: Double, yPercent: Double)

object SendWhiteboardAnnotationEvtMsg { val NAME = "SendWhiteboardAnnotationEvtMsg" }
case class SendWhiteboardAnnotationEvtMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationEvtMsgBody) extends BbbCoreMsg
case class SendWhiteboardAnnotationEvtMsgBody(annotation: AnnotationVO)

object SendWhiteboardAnnotationPubMsg { val NAME = "SendWhiteboardAnnotationPubMsg" }
case class SendWhiteboardAnnotationPubMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationPubMsgBody) extends StandardMsg
case class SendWhiteboardAnnotationPubMsgBody(annotation: AnnotationVO)

object UndoWhiteboardEvtMsg { val NAME = "UndoWhiteboardEvtMsg" }
case class UndoWhiteboardEvtMsg(header: BbbClientMsgHeader, body: UndoWhiteboardEvtMsgBody) extends BbbCoreMsg
case class UndoWhiteboardEvtMsgBody(whiteboardId: String, userId: String, annotationId: String)

object UndoWhiteboardPubMsg { val NAME = "UndoWhiteboardPubMsg" }
case class UndoWhiteboardPubMsg(header: BbbClientMsgHeader, body: UndoWhiteboardPubMsgBody) extends StandardMsg
case class UndoWhiteboardPubMsgBody(whiteboardId: String)
