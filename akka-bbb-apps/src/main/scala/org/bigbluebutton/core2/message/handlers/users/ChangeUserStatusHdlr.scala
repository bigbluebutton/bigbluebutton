package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ChangeUserStatus, UserStatusChange}
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor


trait ChangeUserStatusHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleChangeUserStatus(msg: ChangeUserStatus): Unit = {
    if (Users.hasUserWithId(msg.userID, liveMeeting.users)) {
      outGW.send(new UserStatusChange(props.meetingProp.intId, props.recordProp.record, msg.userID, msg.status, msg.value))
    }
  }

}
