package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationPodVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPod
import org.bigbluebutton.core2.message.senders.MsgBuilder
import org.bigbluebutton.core.running.LiveMeeting
import org.bigbluebutton.core.models.SystemUser

trait CreateDefaultPresentationPod {
  this: PresentationPodHdlrs =>

  def handleCreateDefaultPresentationPod(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {
    val SYSTEM_ID = SystemUser.ID
    val resultPod: PresentationPod = PresentationPodsApp.createDefaultPresentationPod()
    val respMsg = MsgBuilder.buildCreateNewPresentationPodEvtMsg(
      liveMeeting.props.meetingProp.intId,
      resultPod.currentPresenter,
      resultPod.id,
      SYSTEM_ID
    )

    bus.outGW.send(respMsg)
    val pods = state.presentationPodManager.addPod(resultPod)
    state.update(pods)
  }

}
