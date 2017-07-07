package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs.EjectUserFromMeetingCmdMsg
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ BaseMeetingActor, LiveMeeting }

trait EjectUserFromMeetingHdlr {
  this: BaseMeetingActor =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleEjectUserFromMeetingCmdMsg(msg: EjectUserFromMeetingCmdMsg) {

    for {
      user <- Users2x.ejectFromMeeting(liveMeeting.users2x, msg.body.userId)
      regUser <- RegisteredUsers.remove(msg.body.userId, liveMeeting.registeredUsers)
      vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.body.userId)
    } yield {

      log.info("Ejecting user from meeting.  meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.body.userId)

    }
  }
}
