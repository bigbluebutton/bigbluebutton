package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationConversionUpdatePubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationConversionUpdateSysPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    val presentationId = msg.body.presentationId
    val pres = new PresentationInPod(presentationId, msg.body.presName, default = false, current = false, Map.empty, downloadable = false,
      "", removable = true, filenameConverted = msg.body.presName, uploadCompleted = false, numPages = 0, errorDetails = Map.empty)

    // Not updateConversionStarted: this message carries no error information, so it must not
    // touch the error columns. It also creates the row for uploads that have none yet, so a
    // removed or refused presentation is skipped rather than recreated.
    // Once conversion has started the presentation is in a pod and its row holds the real
    // metadata, which this message does not carry. Write the row only before that point.
    val conversionStarted = PresentationPodsApp.findPodWithPresentation(state, presentationId).isDefined
    if (!liveMeeting.droppedPresentations.contains(presentationId) && !conversionStarted) {
      PresPresentationDAO.updateConversionProgress(liveMeeting.props.meetingProp.intId, pres)
    }

    state
  }
}
