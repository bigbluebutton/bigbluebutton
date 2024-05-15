package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationPodVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait SyncGetPresentationPodsMsgHdlr {
  this: PresentationPodHdlrs =>

  def handleSyncGetPresentationPods(state: MeetingState2x, liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildSyncGetPresentationPodsRespMsg(pods: Vector[PresentationPodVO]): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, "nodeJSapp")
      val envelope = BbbCoreEnvelope(SyncGetPresentationPodsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SyncGetPresentationPodsRespMsg.NAME, liveMeeting.props.meetingProp.intId, "nodeJSapp")

      val body = SyncGetPresentationPodsRespMsgBody(pods)
      val event = SyncGetPresentationPodsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    val pods = PresentationPodsApp.getAllPresentationPodsInMeeting(state)

    val podsVO = pods.map(pod => PresentationPodsApp.translatePresentationPodToVO(pod))
    val event = buildSyncGetPresentationPodsRespMsg(podsVO)

    bus.outGW.send(event)

    state
  }

}
