package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core2.MeetingStatus2x
import scala.util.Random

trait SelectRandomViewerReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val outGW: OutMsgRouter

  def handleSelectRandomViewerReqMsg(msg: SelectRandomViewerReqMsg): Unit = {
    log.debug("Received SelectRandomViewerReqMsg {}", SelectRandomViewerReqMsg)

    def broadcastEvent(msg: SelectRandomViewerReqMsg, selectedUser: UserState): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SelectRandomViewerRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SelectRandomViewerRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SelectRandomViewerRespMsgBody(msg.header.userId, selectedUser.intId)
      val event = SelectRandomViewerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to select random user."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val users = Users2x.findNotPresentersNorModerators(liveMeeting.users2x)
      val randNum = new scala.util.Random

      if (users.size > 0) {
        broadcastEvent(msg, users(randNum.nextInt(users.size)))
      }
    }
  }
}
