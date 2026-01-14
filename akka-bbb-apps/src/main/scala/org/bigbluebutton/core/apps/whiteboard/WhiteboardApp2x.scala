package org.bigbluebutton.core.apps.whiteboard

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.common2.msgs.AnnotationVO

case class Whiteboard(
    id:             String,
    annotationsMap: Map[String, AnnotationVO]
)

class WhiteboardApp2x(implicit val context: ActorContext)
  extends SendCursorPositionPubMsgHdlr
  with DeleteWhiteboardAnnotationsPubMsgHdlr
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
    liveMeeting.wbModel.addAnnotations(whiteboardId, liveMeeting.props.meetingProp.intId, requesterId, annotations, isPresenter, isModerator)
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
    liveMeeting.wbModel.deleteAnnotations(whiteboardId, liveMeeting.props.meetingProp.intId, requesterId, annotationsIds, isPresenter, isModerator)
  }

}
