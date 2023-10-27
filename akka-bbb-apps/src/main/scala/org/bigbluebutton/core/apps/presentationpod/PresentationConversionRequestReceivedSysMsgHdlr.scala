package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationInPod
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationConversionRequestReceivedSysMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg:         PresentationConversionRequestReceivedSysMsg,
      state:       MeetingState2x,
      liveMeeting: LiveMeeting
  ) = {

    val meetingId = liveMeeting.props.meetingProp.intId

    val pres = new PresentationInPod(msg.body.presentationId, msg.body.presName, msg.body.default, msg.body.current, Map.empty, msg.body.downloadable,
      "", msg.body.removable, uploadCompleted = false, numPages = -1, errorDetails = Map.empty)

    PresPresentationDAO.insert(meetingId, pres)
    state
  }
}

