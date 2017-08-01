package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.WhiteboardKeyUtil

case class Whiteboard(id: String, annotationCount: Int, annotationsMap: scala.collection.immutable.Map[String, scala.collection.immutable.List[AnnotationVO]])

trait WhiteboardApp2x
    extends SendCursorPositionPubMsgHdlr
    with ClearWhiteboardPubMsgHdlr
    with UndoWhiteboardPubMsgHdlr
    with ModifyWhiteboardAccessPubMsgHdlr
    with GetWhiteboardAccessReqMsgHdlr
    with SendWhiteboardAnnotationPubMsgHdlr
    with SyncWhiteboardAccessRespMsgHdlr
    with GetWhiteboardAnnotationsReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def sendWhiteboardAnnotation(annotation: AnnotationVO): AnnotationVO = {
    //    println("Received whiteboard annotation. status=[" + status + "], annotationType=[" + annotationType + "]")
    var rtnAnnotation: AnnotationVO = annotation

    if (WhiteboardKeyUtil.DRAW_START_STATUS == annotation.status) {
      rtnAnnotation = liveMeeting.wbModel.addAnnotation(annotation.wbId, annotation.userId, annotation)
    } else if (WhiteboardKeyUtil.DRAW_UPDATE_STATUS == annotation.status) {
      if (WhiteboardKeyUtil.PENCIL_TYPE == annotation.annotationType) {
        rtnAnnotation = liveMeeting.wbModel.updateAnnotationPencil(annotation.wbId, annotation.userId, annotation)
      } else {
        rtnAnnotation = liveMeeting.wbModel.updateAnnotation(annotation.wbId, annotation.userId, annotation)
      }
    } else if (WhiteboardKeyUtil.DRAW_END_STATUS == annotation.status) {
      if (WhiteboardKeyUtil.PENCIL_TYPE == annotation.annotationType) {
        rtnAnnotation = liveMeeting.wbModel.endAnnotationPencil(annotation.wbId, annotation.userId, annotation)
      } else {
        rtnAnnotation = liveMeeting.wbModel.updateAnnotation(annotation.wbId, annotation.userId, annotation)
      }
    } else {
      //	    println("Received UNKNOWN whiteboard annotation!!!!. status=[" + status + "], annotationType=[" + annotationType + "]")
    }

    rtnAnnotation
  }

  def getWhiteboardAnnotations(whiteboardId: String): Array[AnnotationVO] = {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    liveMeeting.wbModel.getHistory(whiteboardId)
  }

  def clearWhiteboard(whiteboardId: String, requesterId: String): Option[Boolean] = {
    liveMeeting.wbModel.clearWhiteboard(whiteboardId, requesterId)
  }

  def undoWhiteboard(whiteboardId: String, requesterId: String): Option[AnnotationVO] = {
    liveMeeting.wbModel.undoWhiteboard(whiteboardId, requesterId)
  }

  def modifyWhiteboardAccess(multiUser: Boolean) {
    liveMeeting.wbModel.modifyWhiteboardAccess(multiUser)
  }

  def getWhiteboardAccess(): Boolean = {
    liveMeeting.wbModel.getWhiteboardAccess()
  }
}
