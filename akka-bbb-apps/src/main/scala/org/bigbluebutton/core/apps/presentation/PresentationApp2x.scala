package org.bigbluebutton.core.apps.presentation

import akka.actor.ActorContext
import akka.event.Logging
import org.bigbluebutton.common2.domain.PageVO
import org.bigbluebutton.core.apps.Presentation
import org.bigbluebutton.core.running.LiveMeeting

class PresentationApp2x(implicit val context: ActorContext)
    extends NewPresentationMsgHdlr
    with PreuploadedPresentationsPubMsgHdlr
    with SyncGetPresentationInfoRespMsgHdlr {

  val log = Logging(context.system, getClass)

  def processPreuploadedPresentations(liveMeeting: LiveMeeting, presentations: Vector[Presentation]) {
    presentations.foreach(presentation => {
      liveMeeting.presModel.addPresentation(presentation)
    })

    liveMeeting.presModel.getCurrentPresentation() match {
      case Some(p) => // do nothing
      case None    => setCurrentPresentation(liveMeeting, presentations.head.id)
    }
  }

  def presentationConversionCompleted(liveMeeting: LiveMeeting, presentation: Presentation) {
    liveMeeting.presModel.addPresentation(presentation)
  }

  def setCurrentPresentation(liveMeeting: LiveMeeting, presentationId: String): Option[Presentation] = {
    liveMeeting.presModel.setCurrentPresentation(presentationId)
  }

  def getPresentationInfo(liveMeeting: LiveMeeting): Vector[Presentation] = {
    liveMeeting.presModel.getPresentations
  }

  def setCurrentPage(liveMeeting: LiveMeeting, presentationId: String, pageId: String): Boolean = {
    liveMeeting.presModel.changeCurrentPage(presentationId, pageId)

    /* Need to figure out if this is still needed and if it is how to do it now
    Users.getCurrentPresenter(liveMeeting.users) foreach { pres =>
      handleStopPollRequest(StopPollRequest(props.meetingProp.intId, pres.id))
    }
    */
  }

  def resizeAndMovePage(liveMeeting: LiveMeeting, presentationId: String, pageId: String,
                        xOffset: Double, yOffset: Double, widthRatio: Double,
                        heightRatio: Double): Option[PageVO] = {
    // Force coordinate that are out-of-bounds inside valid values
    // 0.25D is 400% zoom
    // 100D-checkedWidth is the maximum the page can be moved over
    val checkedWidth = Math.min(widthRatio, 100D) //if (widthRatio <= 100D) widthRatio else 100D
    val checkedHeight = Math.min(heightRatio, 100D)
    val checkedXOffset = Math.min(xOffset, 0D)
    val checkedYOffset = Math.min(yOffset, 0D)

    liveMeeting.presModel.resizePage(presentationId, pageId, checkedXOffset, checkedYOffset, checkedWidth, checkedHeight);
  }

  def removePresentation(liveMeeting: LiveMeeting, presentationId: String): Option[Presentation] = {
    liveMeeting.presModel.removePresentation(presentationId)
  }
}
