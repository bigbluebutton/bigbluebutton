package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ LockUserRequest, UserLocked }
import org.bigbluebutton.core.models.{ Users2x }
import org.bigbluebutton.core.running.MeetingActor

trait LockUserRequestHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleLockUserRequest(msg: LockUserRequest) {
    for {
      uvo <- Users2x.setUserLocked(liveMeeting.users2x, msg.userID, msg.lock)
    } yield {
      log.info("Lock user.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.intId + " locked=" + uvo.locked)
      outGW.send(new UserLocked(props.meetingProp.intId, uvo.intId, uvo.locked))
    }
  }
}
