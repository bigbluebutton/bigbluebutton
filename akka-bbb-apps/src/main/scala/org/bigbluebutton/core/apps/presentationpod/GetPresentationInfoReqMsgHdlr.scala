package org.bigbluebutton.core.apps.presentationpod

import org.bigbluebutton.common2.domain.PresentationVO
import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.bus.MessageBus
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.running.LiveMeeting

trait GetPresentationInfoReqMsgHdlr extends RightsManagementTrait {
  this: PresentationPodHdlrs =>

  def handle(msg: GetPresentationInfoReqMsg, state: MeetingState2x,
             liveMeeting: LiveMeeting, bus: MessageBus): MeetingState2x = {

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission get presentation info from meeting."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, bus.outGW, liveMeeting)
      state
    } else {
      def buildGetPresentationInfoRespMsg(presentations: Vector[PresentationVO], podId: String,
                                          requesterId: String): BbbCommonEnvCoreMsg = {
        val routing = Routing.addMsgToClientRouting(MessageTypes.DIRECT, liveMeeting.props.meetingProp.intId, requesterId)
        val envelope = BbbCoreEnvelope(GetPresentationInfoRespMsg.NAME, routing)
        val header = BbbClientMsgHeader(GetPresentationInfoRespMsg.NAME, liveMeeting.props.meetingProp.intId, requesterId)

        val body = GetPresentationInfoRespMsgBody(podId, presentations)
        val event = GetPresentationInfoRespMsg(header, body)

        BbbCommonEnvCoreMsg(envelope, event)
      }

      val requesterId = msg.header.userId
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
}
