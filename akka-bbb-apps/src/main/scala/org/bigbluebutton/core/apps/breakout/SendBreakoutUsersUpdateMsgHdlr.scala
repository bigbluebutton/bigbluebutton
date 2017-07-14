package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs.{ BreakoutUserVO, SendBreakoutUsersUpdateMsg }
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.BreakoutRoomUsersUpdate
import org.bigbluebutton.core.bus.BigBlueButtonEvent
import org.bigbluebutton.core.models.{ Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait SendBreakoutUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleSendBreakoutUsersUpdateMsg(msg: SendBreakoutUsersUpdateMsg): Unit = {

    val users = Users2x.findAll(liveMeeting.users2x)
    val breakoutUsers = users map { u => new BreakoutUserVO(u.extId, u.name) }
    eventBus.publish(BigBlueButtonEvent(
      props.breakoutProps.parentId,
      new BreakoutRoomUsersUpdate(props.breakoutProps.parentId, props.meetingProp.intId, breakoutUsers)
    ))
  }
}
