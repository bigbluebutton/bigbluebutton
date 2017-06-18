package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserUnshareWebcam, UserUnsharedWebcam }
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserUnshareWebcamHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserunshareWebcam(msg: UserUnshareWebcam) {
    for {
      uvo <- Users.userUnsharedWebcam(msg.userId, liveMeeting.users, msg.stream)
    } yield {
      log.info("User unshared webcam.  meetingId=" + props.meetingProp.intId + " userId=" + uvo.id + " stream=" + msg.stream)
      outGW.send(new UserUnsharedWebcam(props.meetingProp.intId, props.recordProp.record, uvo.id, msg.stream))
    }
  }
}
