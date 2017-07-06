package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.MessageRecorder
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.Model1x2xConverter
import org.bigbluebutton.core2.message.senders.{ Sender, UserLeftMeetingEvtMsgSender }

trait EjectUserFromMeetingHdlr {
  this: UsersApp2x =>

  def handle(msg: EjectUserFromMeeting) {

    for {
      user <- Users2x.ejectFromMeeting(liveMeeting.users2x, msg.userId)
      regUser <- RegisteredUsers.remove(msg.userId, liveMeeting.registeredUsers)
      vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.userId)
    } yield {

      log.info("Ejecting user from meeting.  meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.userId)

    }
  }
}
