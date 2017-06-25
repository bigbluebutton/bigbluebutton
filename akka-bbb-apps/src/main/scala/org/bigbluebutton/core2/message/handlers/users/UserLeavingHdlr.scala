package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api.{ UserJoinedVoiceConfMessage, UserLeaving, UserLeft }
import org.bigbluebutton.core.models.Users
import org.bigbluebutton.core.running.MeetingActor

trait UserLeavingHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleUserLeft(msg: UserLeaving): Unit = {
    for {
      u <- Users.userLeft(msg.userID, liveMeeting.users)
    } yield {
      log.info("User left meeting. meetingId=" + props.meetingProp.intId + " userId=" + u.id + " user=" + u)

      checkCaptionOwnerLogOut(u.id)
      liveMeeting.startCheckingIfWeNeedToEndVoiceConf()
      stopAutoStartedRecording()
    }
  }
}
