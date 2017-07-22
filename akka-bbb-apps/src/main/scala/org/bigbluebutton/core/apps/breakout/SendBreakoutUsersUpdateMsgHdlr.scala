package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.core.api.{ BreakoutRoomUsersUpdateInternalMsg, SendBreakoutUsersAuditInternalMsg }
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.common2.msgs.{ BreakoutUserVO }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait SendBreakoutUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSendBreakoutUsersUpdateInternalMsg(msg: SendBreakoutUsersAuditInternalMsg): Unit = {

    val users = Users2x.findAll(liveMeeting.users2x)
    val breakoutUsers = users map { u => new BreakoutUserVO(u.extId, u.name) }

    eventBus.publish(BigBlueButtonEvent(
      props.breakoutProps.parentId,
      new BreakoutRoomUsersUpdateInternalMsg(props.breakoutProps.parentId, props.meetingProp.intId, breakoutUsers)
    ))
  }
}
