package org.bigbluebutton.core.apps.whiteboard

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs.{ AnnotationEvent, AnnotationVO, ModificationVO}
import org.bigbluebutton.core.apps.WhiteboardKeyUtil
import scala.collection.immutable.{ Map, List }
import java.lang.annotation.Annotation
import scala.collection.immutable.TreeSeqMap.OrderBy.Modification

case class Whiteboard(
    id:              String,
    multiUser:       Array[String],
    oldMultiUser:    Array[String],
    changedModeOn:   Long,
    annotationCount: Int,
    annotationsMap:  Map[String, List[AnnotationEvent]]
)

class WhiteboardApp2x(implicit val context: ActorContext)
  extends SendCursorPositionPubMsgHdlr
  with ClearWhiteboardPubMsgHdlr
  with UndoWhiteboardPubMsgHdlr
  with ModifyWhiteboardAccessPubMsgHdlr
  with SendWhiteboardAnnotationPubMsgHdlr
  with GetWhiteboardAnnotationsReqMsgHdlr
  with ModifyWhiteboardAnnotationPubMsgHdlr {

  val log = Logging(context.system, getClass)

  def sanitizeAnnotation(annotation: AnnotationVO): AnnotationVO = {
     // Remove null values by wrapping value with Option. Null becomes None.
     val shape = annotation.annotationInfo.collect {
       case (key, value: Any) => key -> Option(value)
     }

     //printAnnotationShape(shape, annotation)

     if (annotation.annotationInfo.values.exists(p => if (p == null) true else false)) {
       log.warning("Whiteboard shape contains null values. " + annotation.toString)
     }

     // Unwrap the value wrapped as Option
     val shape2 = shape.collect {
       case (key, Some(value)) => key -> value
     }

     annotation.copy(annotationInfo = shape2)
   }

   def modifyWhiteboardAnnotations(annotations: List[AnnotationVO], idsToRemove: List[String], wbId: String, userId:String, liveMeeting: LiveMeeting) = {
      val removedAnnotations = liveMeeting.wbModel.removeAnnotations(modify.idsToRemove, wbId)
      val addedAnnotations = for (ann <- annotations) yield liveMeeting.wbModel.addAnnotation(wbId, userId, ann)
      val modVO = ModificationVO(removedAnnotations = removedAnnotations, addedAnnotations = addedAnnotations, wbId = wbId, userId = userId)
      liveMeeting.wbModel.addModifyAnnotation(modVO)
      modVO
   }

   def removeWhiteboardAnnotations(annotationIds: List[String], wbId: String, liveMeeting: LiveMeeting): List[AnnotationVO] = {
     liveMeeting.wbModel.removeAnnotations(annotationIds, wbId)
   }

  def sendWhiteboardAnnotation(annotation: AnnotationVO, drawEndOnly: Boolean, liveMeeting: LiveMeeting): AnnotationVO = {
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

  def undoWhiteboard(whiteboardId: String, requesterId: String, liveMeeting: LiveMeeting): Option[AnnotationEvent] = {
    liveMeeting.wbModel.undoWhiteboard(whiteboardId, requesterId)
  }

  def getWhiteboardAccess(whiteboardId: String, liveMeeting: LiveMeeting): Array[String] = {
    liveMeeting.wbModel.getWhiteboardAccess(whiteboardId)
  }

  def modifyWhiteboardAccess(whiteboardId: String, multiUser: Array[String], liveMeeting: LiveMeeting) = {
    liveMeeting.wbModel.modifyWhiteboardAccess(whiteboardId, multiUser)
  }

  def filterWhiteboardMessage(whiteboardId: String, userId: String, liveMeeting: LiveMeeting): Boolean = {
    // Need to check if the wb mode change from multi-user to single-user. Give 5sec allowance to
    // allow delayed messages to be handled as clients may have been sending messages while the wb
    // mode was changed. (ralam nov 22, 2017)
    !liveMeeting.wbModel.hasWhiteboardAccess(whiteboardId, userId)
  }
}
