package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.apps.{ PermissionCheck, RightsManagementTrait }
import org.bigbluebutton.core.db.BreakoutRoomUserDAO
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models.{ Roles, Users2x }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait SetBreakoutRoomInviteDismissedReqMsgHdlr extends RightsManagementTrait {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSetBreakoutRoomInviteDismissedReqMsg(msg: SetBreakoutRoomInviteDismissedReqMsg) = {
    for {
      requesterUser <- Users2x.findWithIntId(liveMeeting.users2x, msg.header.userId)
    } yield {
      BreakoutRoomUserDAO.updateInviteDismissedAt(requesterUser.meetingId, requesterUser.intId)
    }
  }
}
