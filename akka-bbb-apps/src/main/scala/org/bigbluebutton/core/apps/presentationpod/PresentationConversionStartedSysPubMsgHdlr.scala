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
    val presentationId = msg.body.common.presentationId
    val podId = msg.body.common.podId

    // An accepted presentation has already been added to its pod by the time this message
    // is handled. Track only those: the completion handler resolves the pod entry as well,
    // so an entry for a presentation that is not in a pod would never be removed.
    val presentationInPod = PresentationPodsApp.getPresentationPod(state, podId)
      .flatMap(_.getPresentation(presentationId))
      .isDefined

    if (!presentationInPod) {
      log.info("Not tracking conversion for presentation not present in pod. " +
        s"meetingId=${liveMeeting.props.meetingProp.intId} podId=$podId presentationId=$presentationId")
      state
    } else {
      state.presentationConversions.find(presentationId) match {
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
    }
  }
}
