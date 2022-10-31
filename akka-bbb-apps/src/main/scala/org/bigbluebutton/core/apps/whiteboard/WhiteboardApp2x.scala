package org.bigbluebutton.core.apps.whiteboard

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs.AnnotationVO
import scala.collection.immutable.{ Map }

case class Whiteboard(
    id:             String,
    multiUser:      Array[String],
    oldMultiUser:   Array[String],
    changedModeOn:  Long,
    annotationsMap: Map[String, AnnotationVO]
)

class WhiteboardApp2x(implicit val context: ActorContext)
  extends SendCursorPositionPubMsgHdlr
  with ClearWhiteboardPubMsgHdlr
  with DeleteWhiteboardAnnotationsPubMsgHdlr
  with ModifyWhiteboardAccessPubMsgHdlr
  with SendWhiteboardAnnotationsPubMsgHdlr
  with GetWhiteboardAnnotationsReqMsgHdlr {

  val log = Logging(context.system, getClass)

  def sendWhiteboardAnnotations(
      whiteboardId: String,
      requesterId:  String,
      annotations:  Array[AnnotationVO],
      liveMeeting:  LiveMeeting,
      isPresenter:  Boolean,
      isModerator:  Boolean
  ): Array[AnnotationVO] = {
    //    println("Received whiteboard annotation. status=[" + status + "], annotationType=[" + annotationType + "]")
    liveMeeting.wbModel.addAnnotations(whiteboardId, requesterId, annotations, isPresenter, isModerator)
  }

  def getWhiteboardAnnotations(whiteboardId: String, liveMeeting: LiveMeeting): Array[AnnotationVO] = {
    //println("WB: Received page history [" + whiteboardId + "]")
    liveMeeting.wbModel.getHistory(whiteboardId)
  }

  def deleteWhiteboardAnnotations(
      whiteboardId:   String,
      requesterId:    String,
      annotationsIds: Array[String],
      liveMeeting:    LiveMeeting,
      isPresenter:    Boolean,
      isModerator:    Boolean
  ): Array[String] = {
    liveMeeting.wbModel.deleteAnnotations(whiteboardId, requesterId, annotationsIds, isPresenter, isModerator)
  }

  def getWhiteboardAccess(whiteboardId: String, liveMeeting: LiveMeeting): Array[String] = {
    liveMeeting.wbModel.getWhiteboardAccess(whiteboardId)
  }

  def modifyWhiteboardAccess(whiteboardId: String, multiUser: Array[String], liveMeeting: LiveMeeting) {
    liveMeeting.wbModel.modifyWhiteboardAccess(whiteboardId, multiUser)
  }

  def filterWhiteboardMessage(whiteboardId: String, userId: String, liveMeeting: LiveMeeting): Boolean = {
    // Need to check if the wb mode change from multi-user to single-user. Give 5sec allowance to
    // allow delayed messages to be handled as clients may have been sending messages while the wb
    // mode was changed. (ralam nov 22, 2017)
    !liveMeeting.wbModel.hasWhiteboardAccess(whiteboardId, userId)
  }

  def isNonEjectionGracePeriodOver(wbId: String, userId: String, liveMeeting: LiveMeeting): Boolean = {
    liveMeeting.wbModel.isNonEjectionGracePeriodOver(wbId, userId)
  }
}
