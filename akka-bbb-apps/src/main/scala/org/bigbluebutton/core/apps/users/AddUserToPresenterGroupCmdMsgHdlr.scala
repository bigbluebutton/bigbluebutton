package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.apps.PermissionCheck

trait AddUserToPresenterGroupCmdMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleAddUserToPresenterGroupCmdMsg(msg: AddUserToPresenterGroupCmdMsg) {

    def broadcastAddUserToPresenterGroup(meetingId: String, userId: String, requesterId: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, meetingId, userId)
      val envelope = BbbCoreEnvelope(UserAddedToPresenterGroupEvtMsg.NAME, routing)
      val header = BbbClientMsgHeader(UserAddedToPresenterGroupEvtMsg.NAME, meetingId, userId)
      val body = UserAddedToPresenterGroupEvtMsgBody(userId, requesterId)
      val event = UserAddedToPresenterGroupEvtMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)

      outGW.send(msgEvent)
    }

    if (applyPermissionCheck && !PermissionCheck.isAllowed(PermissionCheck.MOD_LEVEL, PermissionCheck.VIEWER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to add user to presenter group."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW)
    } else {
      val userId = msg.body.userId
      val requesterId = msg.body.requesterId

      for {
        requester <- Users2x.findWithIntId(liveMeeting.users2x, requesterId)
      } yield {
        if (requester.role == Roles.MODERATOR_ROLE) {
          Users2x.addUserToPresenterGroup(liveMeeting.users2x, userId)
          broadcastAddUserToPresenterGroup(liveMeeting.props.meetingProp.intId, userId, requesterId)
        }
      }
    }
  }

}
