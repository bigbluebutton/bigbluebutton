

package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.{ PresentationPodVO, PresentationVO }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPod
import org.bigbluebutton.core.running.LiveMeeting

trait GetAllPresentationPodsReqMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: GetAllPresentationPodsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    def buildGetAllPresentationPodsRespMsg(pods: Vector[PresentationPodVO], requesterId: String): BbbCommonEnvCoreMsg = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, requesterId)
      val envelope = BbbCoreEnvelope(GetAllPresentationPodsRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(GetAllPresentationPodsRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

      val body = GetAllPresentationPodsRespMsgBody(pods)
      val event = GetAllPresentationPodsRespMsg(header, body)

      BbbCommonEnvCoreMsg(envelope, event)
    }

    log.debug("___________C_____________________")

    val requesterId = msg.body.requesterId

    val pods = PresentationPodsApp.getAllPresentationPodsInMeeting(state)

    log.debug("___________D_____________________" + requesterId)

    val podsVO = pods.map(pod => PresentationPodsApp.translatePresentationPodToVO(pod))
    val event = buildGetAllPresentationPodsRespMsg(podsVO, requesterId)

    bus.outGW.send(event)

    state
  }
}
