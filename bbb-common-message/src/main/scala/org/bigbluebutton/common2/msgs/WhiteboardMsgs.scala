package org.bigbluebutton.common2.msgs
import scala.collection.immutable.List

abstract class AnnotationEvent {
  def wbId: String
  def userId: String
  def position: Int
}

import java.lang.annotation.Annotation
import javax.lang.model.element.AnnotationValueVisitor

abstract class AnnotationEvent {
  def wbId: String
  def userId: String
  def position: Int
}

case class AnnotationVO(id: String, status: String, annotationType: String,
                        annotationInfo: scala.collection.immutable.Map[String, Any], wbId: String, userId: String, position: Int) extends AnnotationEvent
case class ModificationVO(removedAnnotations: List[Tuple2[AnnotationVO, Int]], addedAnnotations: List[AnnotationVO], wbId: String, userId: String, position: Int) extends AnnotationEvent

// ------------ client to akka-apps ------------
object ClientToServerLatencyTracerMsg { val NAME = "ClientToServerLatencyTracerMsg" }
case class ClientToServerLatencyTracerMsg(header: BbbClientMsgHeader, body: ClientToServerLatencyTracerMsgBody) extends StandardMsg
case class ClientToServerLatencyTracerMsgBody(timestampUTC: Long, rtt: Long, senderId: String)

object ClearWhiteboardPubMsg { val NAME = "ClearWhiteboardPubMsg" }
case class ClearWhiteboardPubMsg(header: BbbClientMsgHeader, body: ClearWhiteboardPubMsgBody) extends StandardMsg
case class ClearWhiteboardPubMsgBody(whiteboardId: String)

object GetWhiteboardAnnotationsReqMsg { val NAME = "GetWhiteboardAnnotationsReqMsg" }
case class GetWhiteboardAnnotationsReqMsg(header: BbbClientMsgHeader, body: GetWhiteboardAnnotationsReqMsgBody) extends StandardMsg
case class GetWhiteboardAnnotationsReqMsgBody(whiteboardId: String)

object ModifyWhiteboardAccessPubMsg { val NAME = "ModifyWhiteboardAccessPubMsg" }
case class ModifyWhiteboardAccessPubMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAccessPubMsgBody) extends StandardMsg
case class ModifyWhiteboardAccessPubMsgBody(whiteboardId: String, multiUser: Array[String])

object SendCursorPositionPubMsg { val NAME = "SendCursorPositionPubMsg" }
case class SendCursorPositionPubMsg(header: BbbClientMsgHeader, body: SendCursorPositionPubMsgBody) extends StandardMsg
case class SendCursorPositionPubMsgBody(whiteboardId: String, xPercent: Double, yPercent: Double)

object SendWhiteboardAnnotationPubMsg { val NAME = "SendWhiteboardAnnotationPubMsg" }
case class SendWhiteboardAnnotationPubMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationPubMsgBody) extends StandardMsg
case class SendWhiteboardAnnotationPubMsgBody(annotation: AnnotationVO, drawEndOnly: Boolean)

object SendWhiteboardEraserPubMsg { val NAME = "SendWhiteboardEraserPubMsg" }
case class SendWhiteboardEraserPubMsg(header: BbbClientMsgHeader, body: SendWhiteboardEraserPubMsgBody) extends StandardMsg
case class SendWhiteboardEraserPubMsgBody(annotation: AnnotationVO, drawEndOnly: Boolean)

object UndoWhiteboardPubMsg { val NAME = "UndoWhiteboardPubMsg" }
case class UndoWhiteboardPubMsg(header: BbbClientMsgHeader, body: UndoWhiteboardPubMsgBody) extends StandardMsg
case class UndoWhiteboardPubMsgBody(whiteboardId: String)

object ModifyWhiteboardAnnotationPubMsg { val NAME = "ModifyWhiteboardAnnotationPubMsg" }
case class ModifyWhiteboardAnnotationPubMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAnnotationPubMsgBody) extends StandardMsg
case class ModifyWhiteboardAnnotationPubMsgBody(annotations: List[AnnotationVO], idsToRemove: List[String], userId: String, whiteBoardId: String, action: String)
// ------------ client to akka-apps ------------

// ------------ akka-apps to client ------------
object ServerToClientLatencyTracerMsg { val NAME = "ServerToClientLatencyTracerMsg" }
case class ServerToClientLatencyTracerMsg(header: BbbClientMsgHeader, body: ServerToClientLatencyTracerMsgBody) extends BbbCoreMsg
case class ServerToClientLatencyTracerMsgBody(timestampUTC: Long, rtt: Long, senderId: String)

object DoLatencyTracerMsg { val NAME = "DoLatencyTracerMsg" }
case class DoLatencyTracerMsg(header: BbbClientMsgHeader, body: DoLatencyTracerMsgBody) extends BbbCoreMsg
case class DoLatencyTracerMsgBody(timestampUTC: Long)

object ClearWhiteboardEvtMsg { val NAME = "ClearWhiteboardEvtMsg" }
case class ClearWhiteboardEvtMsg(header: BbbClientMsgHeader, body: ClearWhiteboardEvtMsgBody) extends BbbCoreMsg
case class ClearWhiteboardEvtMsgBody(whiteboardId: String, userId: String, fullClear: Boolean)

object GetWhiteboardAnnotationsRespMsg { val NAME = "GetWhiteboardAnnotationsRespMsg" }
case class GetWhiteboardAnnotationsRespMsg(header: BbbClientMsgHeader, body: GetWhiteboardAnnotationsRespMsgBody) extends BbbCoreMsg
case class GetWhiteboardAnnotationsRespMsgBody(whiteboardId: String, annotations: Array[AnnotationVO], multiUser: Array[String])

object ModifyWhiteboardAccessEvtMsg { val NAME = "ModifyWhiteboardAccessEvtMsg" }
case class ModifyWhiteboardAccessEvtMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAccessEvtMsgBody) extends BbbCoreMsg
case class ModifyWhiteboardAccessEvtMsgBody(whiteboardId: String, multiUser: Array[String])

object SendCursorPositionEvtMsg { val NAME = "SendCursorPositionEvtMsg" }
case class SendCursorPositionEvtMsg(header: BbbClientMsgHeader, body: SendCursorPositionEvtMsgBody) extends BbbCoreMsg
case class SendCursorPositionEvtMsgBody(whiteboardId: String, xPercent: Double, yPercent: Double)

object SendWhiteboardAnnotationEvtMsg { val NAME = "SendWhiteboardAnnotationEvtMsg" }
case class SendWhiteboardAnnotationEvtMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationEvtMsgBody) extends BbbCoreMsg
case class SendWhiteboardAnnotationEvtMsgBody(annotation: AnnotationVO)

object ModifyWhiteboardAnnotationEvtMsg { val NAME = "ModifyWhiteboardAnnotationEvtMsg" }
case class ModifyWhiteboardAnnotationEvtMsg(header: BbbClientMsgHeader, body: ModifyWhiteboardAnnotationEvtMsgBody) extends StandardMsg
case class ModifyWhiteboardAnnotationEvtMsgBody(annotations: List[AnnotationVO], idsToRemove: List[String], userId: String, whiteboardId: String, action: String)

object SendWhiteboardEraserEvtMsg { val NAME = "SendWhiteboardEraserEvtMsg" }
case class SendWhiteboardEraserEvtMsg(header: BbbClientMsgHeader, body: SendWhiteboardEraserEvtMsgBody) extends BbbCoreMsg
case class SendWhiteboardEraserEvtMsgBody(whiteboardId: String, userId: String, eraserId: String, annotationsToAdd: List[AnnotationVO], idsToRemove: List[String])
// ------------ akka-apps to client ------------