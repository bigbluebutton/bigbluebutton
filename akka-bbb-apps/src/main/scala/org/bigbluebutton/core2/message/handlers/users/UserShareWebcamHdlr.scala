package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{UserShareWebcam, UserSharedWebcam}
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserShareWebcamHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserShareWebcam(msg: UserShareWebcam) {
    for {
      uvo <- Users.userSharedWebcam(msg.userId, liveMeeting.users, msg.stream)
    } yield {
      log.info("User shared webcam.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " stream=" + msg.stream)
      outGW.send(new UserSharedWebcam(props.meetingProp.intId, props.recordProp.record, uvo.id, msg.stream))
    }
  }

}
