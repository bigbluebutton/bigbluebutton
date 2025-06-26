package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs.PresentationConversionStartedSysPubMsg
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationConversion
import org.bigbluebutton.core.running.LiveMeeting

trait PresentationConversionStartedSysPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: PresentationConversionStartedSysPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val presentationId = msg.body.presentationId

    val updatedState = state.presentationConversions.find(presentationId) match {
      case Some(_) =>
        state
      case None =>
        val pc = PresentationConversion(
          presId = presentationId,
          startTime = System.currentTimeMillis(),
          maxDuration = msg.body.maxDuration
        )
        val presentationConversions = state.presentationConversions.add(pc)
        state.update(presentationConversions)
    }

    updatedState
  }
}
