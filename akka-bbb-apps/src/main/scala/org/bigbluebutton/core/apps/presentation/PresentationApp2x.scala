package org.bigbluebutton.core.apps.presentation

import akka.actor.ActorContext
import akka.event.Logging
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

  def setCurrentPresentation(liveMeeting: LiveMeeting, presentationId: String): Option[Presentation] = {
    liveMeeting.presModel.setCurrentPresentation(presentationId)
  }

  def getPresentationInfo(liveMeeting: LiveMeeting): Vector[Presentation] = {
    liveMeeting.presModel.getPresentations
  }

}
