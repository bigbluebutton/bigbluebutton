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

    PresPresentationDAO.updateConversionStarted(liveMeeting.props.meetingProp.intId, pres)

    state
  }
}
