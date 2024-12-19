package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.db.PresPresentationDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationConversionFailedErrorSysPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(
      msg: PresentationConversionFailedErrorSysPubMsg, state: MeetingState2x,
      liveMeeting: LiveMeeting, bus: MessageBus
  ): MeetingState2x = {

    val errorDetails = scala.collection.immutable.Map(
      msg.body.messageKey -> msg.body.errorDetail
    )

    PresPresentationDAO.updateErrors(msg.body.presentationId, msg.body.messageKey, errorDetails)
    state
  }
}
