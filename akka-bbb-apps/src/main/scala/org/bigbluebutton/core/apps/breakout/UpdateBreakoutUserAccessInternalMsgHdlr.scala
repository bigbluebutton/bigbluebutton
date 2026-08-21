package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.UpdateBreakoutUserAccessInternalMsg
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.{ LiveMeeting, MeetingActor }

trait UpdateBreakoutUserAccessInternalMsgHdlr {
  this: MeetingActor =>

  val liveMeeting: LiveMeeting

  def handleUpdateBreakoutUserAccessInternalMsg(msg: UpdateBreakoutUserAccessInternalMsg): Unit = {
    if (msg.revoked) {
      RegisteredUsers.revokeExtId(liveMeeting.registeredUsers, msg.extUserId)
    } else {
      RegisteredUsers.restoreExtId(liveMeeting.registeredUsers, msg.extUserId)
    }

    log.info("Update breakout user access extUserId={} revoked={} in breakoutId={}", msg.extUserId, msg.revoked, msg.breakoutId)
  }
}
