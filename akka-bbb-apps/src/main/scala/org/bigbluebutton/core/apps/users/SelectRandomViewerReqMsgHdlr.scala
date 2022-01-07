package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core.models.{ UserState, Users2x }
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core2.MeetingStatus2x
import org.bigbluebutton.SystemConfiguration
import scala.util.Random

trait SelectRandomViewerReqMsgHdlr extends RightsManagementTrait {
  this: UsersApp =>

  val outGW: OutMsgRouter

  def handleSelectRandomViewerReqMsg(msg: SelectRandomViewerReqMsg): Unit = {
    log.debug("Received SelectRandomViewerReqMsg {}", SelectRandomViewerReqMsg)

    def broadcastEvent(msg: SelectRandomViewerReqMsg, users: Vector[String], choice: String): Unit = {
      val routing = Routing.addMsgToClientRouting(MessageTypes.BROADCAST_TO_MEETING, liveMeeting.props.meetingProp.intId, msg.header.userId)
      val envelope = BbbCoreEnvelope(SelectRandomViewerRespMsg.NAME, routing)
      val header = BbbClientMsgHeader(SelectRandomViewerRespMsg.NAME, liveMeeting.props.meetingProp.intId, msg.header.userId)

      val body = SelectRandomViewerRespMsgBody(msg.header.userId, users, choice)
      val event = SelectRandomViewerRespMsg(header, body)
      val msgEvent = BbbCommonEnvCoreMsg(envelope, event)
      outGW.send(msgEvent)
    }

    if (permissionFailed(PermissionCheck.GUEST_LEVEL, PermissionCheck.PRESENTER_LEVEL, liveMeeting.users2x, msg.header.userId)) {
      val meetingId = liveMeeting.props.meetingProp.intId
      val reason = "No permission to select random user."
      PermissionCheck.ejectUserForFailedPermission(meetingId, msg.header.userId, reason, outGW, liveMeeting)
    } else {
      val users = Users2x.getRandomlyPickableUsers(liveMeeting.users2x, false)

      val usersPicked = Users2x.getRandomlyPickableUsers(liveMeeting.users2x, reduceDuplicatedPick)

      val randNum = new scala.util.Random
      val pickedUser = if (usersPicked.size == 0) "" else usersPicked(randNum.nextInt(usersPicked.size)).intId

      if (reduceDuplicatedPick) {
        if (usersPicked.size == 1) {
          // Initialise the exemption
          val usersToUnexempt = Users2x.findAll(liveMeeting.users2x)
          usersToUnexempt foreach { u =>
            Users2x.setUserExempted(liveMeeting.users2x, u.intId, false)
          }
        } else if (usersPicked.size > 1) {
          Users2x.setUserExempted(liveMeeting.users2x, pickedUser, true)
        }
      }
      val userIds = users.map { case (v) => v.intId }
      broadcastEvent(msg, userIds, pickedUser)
    }
  }
}
