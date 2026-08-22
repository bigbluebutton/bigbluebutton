package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.{ EjectUserFromBreakoutInternalMsg, UpdateBreakoutUserAccessInternalMsg }
import org.bigbluebutton.core.models.{ EjectReasonCode, RegisteredUsers, SystemUser, Users2x }
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

trait UpdateBreakoutUserAccessInternalMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting

  def handleUpdateBreakoutUserAccessInternalMsg(msg: UpdateBreakoutUserAccessInternalMsg): Unit = {
    if (msg.revoked) {
      RegisteredUsers.revokeExtId(liveMeeting.registeredUsers, msg.extUserId)

      val stillInRoom = RegisteredUsers.findAllWithExternUserId(msg.extUserId, liveMeeting.registeredUsers)
        .exists(ru => Users2x.findWithIntId(liveMeeting.users2x, ru.id).nonEmpty)

      if (stillInRoom) {
        handleEjectUserFromBreakoutInternalMsgHdlr(EjectUserFromBreakoutInternalMsg(
          msg.parentId,
          msg.breakoutId,
          msg.extUserId,
          SystemUser.ID,
          "Breakout room access revoked",
          EjectReasonCode.PERMISSION_FAILED,
          ban = false
        ))
      }
    } else {
      RegisteredUsers.restoreExtId(liveMeeting.registeredUsers, msg.extUserId)
    }

    log.info("Update breakout user access extUserId={} revoked={} in breakoutId={}", msg.extUserId, msg.revoked, msg.breakoutId)
  }
}
