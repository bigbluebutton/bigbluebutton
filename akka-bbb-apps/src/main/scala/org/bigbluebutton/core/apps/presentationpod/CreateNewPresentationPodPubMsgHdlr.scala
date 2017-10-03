package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait CreateNewPresentationPodPubMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: CreateNewPresentationPodPubMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildCreateNewPresentationPodEvtMsg(meetingId: String, ownerId: String, podId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, ownerId)
      val envelope = BbbCoreEnvelope(CreateNewPresentationPodEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(CreateNewPresentationPodEvtMsg.NAME, meetingId, ownerId)

      val body = CreateNewPresentationPodEvtMsgBody(ownerId, podId)
      val event = CreateNewPresentationPodEvtMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val ownerId = msg.body.ownerId
    val pod = PresentationPodsApp.createPresentationPod(ownerId)
    val respMsg = buildCreateNewPresentationPodEvtMsg(
      liveMeeting.props.meetingProp.intId,
      ownerId, pod.id
    )
    bus.outGW.send(respMsg)

    val pods = state.presentationPodManager.addPod(pod)

    log.warning("_____ pres pod add, after:" + pods.getNumberOfPods())

    state.update(pods)

  }
}
