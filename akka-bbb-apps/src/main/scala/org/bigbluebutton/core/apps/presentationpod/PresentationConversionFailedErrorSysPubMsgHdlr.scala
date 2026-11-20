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

    // A removed or refused presentation keeps its current row state (or stays deleted).
    if (!liveMeeting.droppedPresentations.contains(msg.body.presentationId)) {
      val errorDetails = scala.collection.immutable.Map(
        msg.body.messageKey -> msg.body.errorDetail
      )

      if (msg.body.messageKey == "PRESENTATION_UPLOAD_FAILED") {
        // The file of an upload never arrived. Only a presentation still waiting for it is marked:
        // its row is not created here, or one removed in the meantime would come back.
        PresPresentationDAO.updateErrorsOfAwaitingUpload(
          liveMeeting.props.meetingProp.intId, msg.body.presentationId, msg.body.messageKey, errorDetails
        )
      } else {
        // updateErrors is a plain UPDATE, so ensure the row exists first. No-op when it already does.
        PresPresentationDAO.insertUploadTokenIfNotExists(
          liveMeeting.props.meetingProp.intId, "", "", msg.body.presentationId, "", msg.body.presName
        )
        PresPresentationDAO.updateErrors(msg.body.presentationId, msg.body.messageKey, errorDetails)
      }
    }
    state
  }
}
