package org.bigbluebutton.core.apps.whiteboard

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs.AnnotationVO
import org.bigbluebutton.core.apps.WhiteboardKeyUtil
import scala.collection.immutable.{ Map, List }

case class Whiteboard(
    id:              String,
    multiUser:       Array[String],
    oldMultiUser:    Array[String],
    changedModeOn:   Long,
    annotationCount: Int,
    annotationsMap:  Map[String, List[AnnotationVO]]
)

class WhiteboardApp2x(implicit val context: ActorContext)
  extends SendCursorPositionPubMsgHdlr
  with ClearWhiteboardPubMsgHdlr
  with UndoWhiteboardPubMsgHdlr
  with ModifyWhiteboardAccessPubMsgHdlr
  with ModifyWBModePubMsgHdlr
  with SendWhiteboardAnnotationPubMsgHdlr
  with GetWhiteboardAnnotationsReqMsgHdlr {

  val log = Logging(context.system, getClass)

  def sendWhiteboardAnnotation(annotation: AnnotationVO, drawEndOnly: Boolean, liveMeeting: LiveMeeting): AnnotationVO = {
    //    println("Received whiteboard annotation. status=[" + status + "], annotationType=[" + annotationType + "]")
    var rtnAnnotation: AnnotationVO = annotation

    if (WhiteboardKeyUtil.DRAW_START_STATUS == annotation.status) {
      //This does not happen anymore since 2.3
      rtnAnnotation = liveMeeting.wbModel.addAnnotation(annotation.wbId, annotation.userId, annotation)
    } else if (WhiteboardKeyUtil.DRAW_UPDATE_STATUS == annotation.status) {
      if (WhiteboardKeyUtil.PENCIL_TYPE == annotation.annotationType) {
        rtnAnnotation = liveMeeting.wbModel.updateAnnotationPencil(annotation.wbId, annotation.userId, annotation)
      } else {
        rtnAnnotation = liveMeeting.wbModel.updateAnnotation(annotation.wbId, annotation.userId, annotation)
      }
    } else if (WhiteboardKeyUtil.DRAW_END_STATUS == annotation.status) {
      if (WhiteboardKeyUtil.PENCIL_TYPE == annotation.annotationType) {
        rtnAnnotation = liveMeeting.wbModel.endAnnotationPencil(annotation.wbId, annotation.userId, annotation, drawEndOnly)
      } else {
        rtnAnnotation = liveMeeting.wbModel.updateAnnotation(annotation.wbId, annotation.userId, annotation)
      }
    } else {
      //	    println("Received UNKNOWN whiteboard annotation!!!!. status=[" + status + "], annotationType=[" + annotationType + "]")
    }

    rtnAnnotation
  }

  def getWhiteboardAnnotations(whiteboardId: String, liveMeeting: LiveMeeting): Array[AnnotationVO] = {
    //println("WB: Received page history [" + msg.whiteboardId + "]")
    liveMeeting.wbModel.getHistory(whiteboardId)
  }

  def clearWhiteboard(whiteboardId: String, requesterId: String, liveMeeting: LiveMeeting): Option[Boolean] = {
    liveMeeting.wbModel.clearWhiteboard(whiteboardId, requesterId)
  }

  def undoWhiteboard(whiteboardId: String, requesterId: String, liveMeeting: LiveMeeting): Option[AnnotationVO] = {
    liveMeeting.wbModel.undoWhiteboard(whiteboardId, requesterId)
  }

  def getWhiteboardAccess(whiteboardId: String, liveMeeting: LiveMeeting): Array[String] = {
    liveMeeting.wbModel.getWhiteboardAccess(whiteboardId)
  }

  def modifyWhiteboardAccess(whiteboardId: String, multiUser: Array[String], liveMeeting: LiveMeeting) {
    liveMeeting.wbModel.modifyWhiteboardAccess(whiteboardId, multiUser)
  }

  def modifyWBMode(meetingId: String, whiteboardMode: Map[String, Boolean], liveMeeting: LiveMeeting) {
    liveMeeting.wbModel.modifyWBMode(meetingId, whiteboardMode)
  }
      
  def filterWhiteboardMessage(whiteboardId: String, userId: String, liveMeeting: LiveMeeting): Boolean = {
    // Need to check if the wb mode change from multi-user to single-user. Give 5sec allowance to
    // allow delayed messages to be handled as clients may have been sending messages while the wb
    // mode was changed. (ralam nov 22, 2017)
    !liveMeeting.wbModel.hasWhiteboardAccess(whiteboardId, userId)
  }
}
