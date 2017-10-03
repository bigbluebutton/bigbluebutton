package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait GetPresentationInfoReqMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: GetPresentationInfoReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildGetPresentationInfoRespMsg(presentations: Vector[PresentationVO], podId: String,
                                        requesterId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, requesterId)
      val envelope = BbbCoreEnvelope(GetPresentationInfoRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetPresentationInfoRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

      val body = GetPresentationInfoRespMsgBody(podId, presentations)
      val event = GetPresentationInfoRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val requesterId = msg.body.userId
    val podId = msg.body.podId

    for {
      pod <- PresentationPodsApp.getPresentationPod(state, podId)
    } yield {
      val presInPod = pod.presentations

      val presVOs = presInPod.values.map { p =>
        PresentationVO(p.id, p.name, p.current, p.pages.values.toVector, p.downloadable)
      }.toVector
      val event = buildGetPresentationInfoRespMsg(presVOs, podId, requesterId)

      bus.outGW.send(event)

    }
    state
  }
}
