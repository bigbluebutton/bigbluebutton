package org.bigbluebutton.core.apps.users

import org.bigbluebutton.core.MessageRecorder
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.util.Model1x2xConverter
import org.bigbluebutton.core2.message.senders.{ MsgSenders1x, Sender, UserLeftMeetingEvtMsgSender }

trait EjectUserFromMeetingHdlr extends MsgSenders1x {
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

      val event = UserLeftMeetingEvtMsgSender.build(liveMeeting.props.meetingProp.intId, user)
      Sender.send(outGW, event)

      MessageRecorder.record(outGW, liveMeeting.props.recordProp.record, event.core)
    }
  }
}
