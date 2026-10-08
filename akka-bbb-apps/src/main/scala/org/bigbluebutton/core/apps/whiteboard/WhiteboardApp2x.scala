package org.bigbluebutton.core.apps.whiteboard

import org.apache.pekko.actor.ActorContext
import org.apache.pekko.event.Logging
import org.bigbluebutton.core.apps.presentationpod.PresentationPodsApp
import org.bigbluebutton.core.domain.MeetingState2x
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
      state:        MeetingState2x,
      liveMeeting:  LiveMeeting,
      isPresenter:  Boolean,
      isModerator:  Boolean
  ): Array[AnnotationVO] = {
    val meetingId = liveMeeting.props.meetingProp.intId

    if (!PresentationPodsApp.pageBelongsToMeeting(state, whiteboardId)) {
      log.warning(
        "Ignoring whiteboard annotations for page {} not belonging to meeting {} (user {}).",
        whiteboardId, meetingId, requesterId
      )
      Array.empty[AnnotationVO]
    } else {
      val ownedAnnotations = annotations.filter { annotation =>
        annotation.wbId == whiteboardId || PresentationPodsApp.pageBelongsToMeeting(state, annotation.wbId)
      }

      if (ownedAnnotations.length != annotations.length) {
        log.warning(
          "Dropped {} of {} annotations targeting pages not belonging to meeting {} (user {}).",
          annotations.length - ownedAnnotations.length, annotations.length, meetingId, requesterId
        )
      }

      ownedAnnotations.map(_.wbId).distinct.flatMap { pageId =>
        liveMeeting.wbModel.addAnnotations(
          pageId, meetingId, requesterId, ownedAnnotations.filter(_.wbId == pageId), isPresenter, isModerator
        )
      }
    }
  }

  def getWhiteboardAnnotations(whiteboardId: String, liveMeeting: LiveMeeting): Array[AnnotationVO] = {
    //println("WB: Received page history [" + whiteboardId + "]")
    liveMeeting.wbModel.getHistory(whiteboardId)
  }

  def deleteWhiteboardAnnotations(
      whiteboardId:   String,
      requesterId:    String,
      annotationsIds: Array[String],
      state:          MeetingState2x,
      liveMeeting:    LiveMeeting,
      isPresenter:    Boolean,
      isModerator:    Boolean
  ): Array[String] = {
    val meetingId = liveMeeting.props.meetingProp.intId

    if (!PresentationPodsApp.pageBelongsToMeeting(state, whiteboardId)) {
      log.warning(
        "Ignoring whiteboard annotation deletion for page {} not belonging to meeting {} (user {}).",
        whiteboardId, meetingId, requesterId
      )
      Array.empty[String]
    } else {
      liveMeeting.wbModel.deleteAnnotations(whiteboardId, meetingId, requesterId, annotationsIds, isPresenter, isModerator)
    }
  }

}
