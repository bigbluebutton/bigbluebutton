package org.bigbluebutton.core.apps.breakout

import org.bigbluebutton.common2.msgs.{ BreakoutUserVO, SendBreakoutUsersUpdateMsg }
import org.bigbluebutton.core.models.Users2x
import org.bigbluebutton.core.running.{ MeetingActor, OutMsgRouter }

trait SendBreakoutUsersUpdateMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMsgRouter

  def handleSendBreakoutUsersUpdateMsg(msg: SendBreakoutUsersUpdateMsg): Unit = {

    val users = Users2x.findAll(liveMeeting.users2x)
    val breakoutUsers = users map { u => new BreakoutUserVO(u.extId, u.name) }
    /** TODO Need to figure out how to do this in a 2.0 way */
    log.error("**** SendBreakoutUsersUpdateMsgHdlr isn't finished and needs a new part *****")
    //eventBus.publish(BigBlueButtonEvent(props.breakoutProps.parentId,
    //  new BreakoutRoomUsersUpdate(props.breakoutProps.parentId, props.meetingProp.intId, breakoutUsers)))
  }
}
