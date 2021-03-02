package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.{ SendBreakoutUsersAuditInternalMsg }
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait SendBreakoutUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSendBreakoutUsersUpdateInternalMsg(msg: SendBreakoutUsersAuditInternalMsg): Unit = {

    BreakoutHdlrHelpers.updateParentMeetingWithUsers(
      liveMeeting,
      eventBus
    )
  }
}
