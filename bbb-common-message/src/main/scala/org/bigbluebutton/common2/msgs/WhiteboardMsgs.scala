package org.bigbluebutton.common2.msgs

case class AnnotationVO(id: String, annotationInfo: scala.collection.immutable.Map[String, Any],
                        wbId: String, userId: String)

case class PresentationPageForExport(
  page: Int,
  xOffset: Double,
  yOffset: Double,
  widthRatio: Double,
  heightRatio: Double,
  annotations: Array[AnnotationVO],
)

case class StoredAnnotations(
  jobId: String,
  presId: String,
  pages: List[PresentationPageForExport],
)

case class ExportJob(
  jobId: String,
  jobType: String,
  filename: String,
  presId: String,
  presLocation: String,
  allPages: Boolean,
  pages: List[Int],
  parentMeetingId: String,
  presUploadToken: String,
)

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

object SendWhiteboardAnnotationsPubMsg { val NAME = "SendWhiteboardAnnotationsPubMsg" }
case class SendWhiteboardAnnotationsPubMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationsPubMsgBody) extends StandardMsg
case class SendWhiteboardAnnotationsPubMsgBody(whiteboardId: String, annotations: Array[AnnotationVO], html5InstanceId: String)

object DeleteWhiteboardAnnotationsPubMsg { val NAME = "DeleteWhiteboardAnnotationsPubMsg" }
case class DeleteWhiteboardAnnotationsPubMsg(header: BbbClientMsgHeader, body: DeleteWhiteboardAnnotationsPubMsgBody) extends StandardMsg
case class DeleteWhiteboardAnnotationsPubMsgBody(whiteboardId: String, annotationsIds: Array[String])
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

object SendWhiteboardAnnotationsEvtMsg { val NAME = "SendWhiteboardAnnotationsEvtMsg" }
case class SendWhiteboardAnnotationsEvtMsg(header: BbbClientMsgHeader, body: SendWhiteboardAnnotationsEvtMsgBody) extends BbbCoreMsg
case class SendWhiteboardAnnotationsEvtMsgBody(whiteboardId: String, annotations: Array[AnnotationVO])

object DeleteWhiteboardAnnotationsEvtMsg { val NAME = "DeleteWhiteboardAnnotationsEvtMsg" }
case class DeleteWhiteboardAnnotationsEvtMsg(header: BbbClientMsgHeader, body: DeleteWhiteboardAnnotationsEvtMsgBody) extends BbbCoreMsg
case class DeleteWhiteboardAnnotationsEvtMsgBody(whiteboardId: String, annotationsIds: Array[String])

// ------------ akka-apps to client ------------
object StoreAnnotationsInRedisSysMsg { val NAME = "StoreAnnotationsInRedisSysMsg" }
case class StoreAnnotationsInRedisSysMsg(header: BbbCoreHeaderWithMeetingId, body:   StoreAnnotationsInRedisSysMsgBody) extends BbbCoreMsg
case class StoreAnnotationsInRedisSysMsgBody(annotations: StoredAnnotations)

object StoreExportJobInRedisSysMsg { val NAME = "StoreExportJobInRedisSysMsg" }
case class StoreExportJobInRedisSysMsg(header: BbbCoreHeaderWithMeetingId, body:   StoreExportJobInRedisSysMsgBody) extends BbbCoreMsg
case class StoreExportJobInRedisSysMsgBody(exportJob: ExportJob)
