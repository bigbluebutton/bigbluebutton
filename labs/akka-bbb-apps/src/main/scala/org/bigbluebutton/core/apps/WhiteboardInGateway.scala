package org.bigbluebutton.core.apps.whiteboard

import org.bigbluebutton.core.BigBlueButtonGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.apps.whiteboard.vo.AnnotationVO

class WhiteboardInGateway(bbbGW: BigBlueButtonGateway) {

  private def buildAnnotation(annotation: Map[String, Object]): Option[AnnotationVO] = {
    var shape: Option[AnnotationVO] = None

    val id = annotation.getOrElse("id", null).asInstanceOf[String]
    val shapeType = annotation.getOrElse("type", null).asInstanceOf[String]
    val status = annotation.getOrElse("status", null).asInstanceOf[String]
    val wbId = annotation.getOrElse("whiteboardId", null).asInstanceOf[String]
    //    println("** GOT ANNOTATION status[" + status + "] shape=[" + shapeType + "]");

    if (id != null && shapeType != null && status != null && wbId != null) {
      shape = Some(new AnnotationVO(id, status, shapeType, annotation.toMap, wbId))
    }

    shape
  }

  def sendWhiteboardAnnotation(meetingID: String, requesterID: String, annotation: Map[String, Object]) {
    buildAnnotation(annotation) match {
      case Some(shape) => {
        bbbGW.accept(new SendWhiteboardAnnotationRequest(meetingID, requesterID, shape))
      }
      case None => // do nothing
    }
  }

  def requestWhiteboardAnnotationHistory(meetingID: String, requesterID: String, whiteboardId: String, replyTo: String) {
    bbbGW.accept(new GetWhiteboardShapesRequest(meetingID, requesterID, whiteboardId, replyTo))
  }

  def clearWhiteboard(meetingID: String, requesterID: String, whiteboardId: String) {
    bbbGW.accept(new ClearWhiteboardRequest(meetingID, requesterID, whiteboardId))
  }

  def undoWhiteboard(meetingID: String, requesterID: String, whiteboardId: String) {
    bbbGW.accept(new UndoWhiteboardRequest(meetingID, requesterID, whiteboardId))
  }

  def enableWhiteboard(meetingID: String, requesterID: String, enable: Boolean) {
    bbbGW.accept(new EnableWhiteboardRequest(meetingID, requesterID, enable))
  }

  def isWhiteboardEnabled(meetingID: String, requesterID: String, replyTo: String) {
    bbbGW.accept(new IsWhiteboardEnabledRequest(meetingID, requesterID, replyTo))
  }

}