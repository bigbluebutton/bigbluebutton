package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{LockUserRequest, UserLocked}
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait LockUserRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleLockUserRequest(msg: LockUserRequest) {
    for {
      uvo <- Users.lockUser(msg.userID, msg.lock, liveMeeting.users)
    } yield {
      log.info("Lock user.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " locked=" + uvo.locked)
      outGW.send(new UserLocked(props.meetingProp.intId, uvo.id, uvo.locked))
    }
  }
}
