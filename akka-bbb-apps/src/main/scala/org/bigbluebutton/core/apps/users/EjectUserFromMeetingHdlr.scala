package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.Model1x2xConverter
import org.bigbluebutton.core2.message.senders.{ MessageSenders, MsgSenders1x }

trait EjectUserFromMeetingHdlr extends MessageSenders with MsgSenders1x {
  this: UsersApp2x =>

  def handle(msg: EjectUserFromMeeting) {

    for {
      user <- Users2x.ejectFromMeeting(liveMeeting.users2x, msg.userId)
      regUser <- RegisteredUsers.remove(msg.userId, liveMeeting.registeredUsers)
      vu <- VoiceUsers.findWithIntId(liveMeeting.voiceUsers, msg.userId)
    } yield {
      sendEjectVoiceUser(msg.userId, msg.ejectedBy, vu.voiceUserId)

      log.info("Ejecting user from meeting.  meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.userId)

      sendUserEjectedFromMeeting(msg.userId, msg.ejectedBy)
      sendDisconnectUser(msg.userId)

      val voiceUser = Model1x2xConverter.toVoiceUser(vu)
      val userVO = Model1x2xConverter.toUserVO(user, voiceUser, Vector.empty)
      sendUserLeft(userVO)

      sendUserLeftMeetingEvtMsg(liveMeeting.props.meetingProp.intId, user, liveMeeting.props.recordProp.record)
    }
  }
}
