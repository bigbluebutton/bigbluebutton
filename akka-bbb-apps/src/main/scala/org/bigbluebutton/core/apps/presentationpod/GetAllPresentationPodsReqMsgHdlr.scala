package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.{ PresentationPodVO, PresentationVO }
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.PermissionCheck
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.PresentationPod
import org.bigbluebutton.core.running.LiveMeeting

trait GetAllPresentationPodsReqMsgHdlr {
  this: PresentationPodHdlrs =>

  def handle(msg: GetAllPresentationPodsReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    if (applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.GUEST_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to get all presentation pods from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW)
      state
    } else {
      def buildGetAllPresentationPodsRespMsg(pods: Vector[PresentationPodVO], requesterId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, requesterId)
        val envelope = BbbCoreEnvelope(GetAllPresentationPodsRespMsg.NAME, routing)
        val header = BbbClientMsgHeader(GetAllPresentationPodsRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

        val body = GetAllPresentationPodsRespMsgBody(pods)
        val event = GetAllPresentationPodsRespMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val requesterId = msg.body.requesterId

      val pods = PresentationPodsApp.getAllPresentationPodsInMeeting(state)

      val podsVO = pods.map(pod => PresentationPodsApp.translatePresentationPodToVO(pod))
      val event = buildGetAllPresentationPodsRespMsg(podsVO, requesterId)

      bus.outGW.send(event)

      state
    }

  }
}
