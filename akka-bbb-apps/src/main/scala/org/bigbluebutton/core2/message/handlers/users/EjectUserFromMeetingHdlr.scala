package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.api._
import org.bigbluebutton.core.models.{RegisteredUsers, Users}
import org.bigbluebutton.core.running.MeetingActor

trait EjectUserFromMeetingHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleEjectUserFromMeeting(msg: EjectUserFromMeeting) {
    for {
      user <- Users.userLeft(msg.userId, liveMeeting.users)
    } yield {
      if (user.voiceUser.joined) {
        outGW.send(new EjectVoiceUser(props.meetingProp.intId, props.recordProp.record,
          msg.ejectedBy, msg.userId, props.voiceProp.voiceConf, user.voiceUser.userId))
      }
      RegisteredUsers.remove(msg.userId, liveMeeting.registeredUsers)
      makeSurePresenterIsAssigned(user)

      log.info("Ejecting user from meeting.  meetingId=" + props.meetingProp.intId + " userId=" + msg.userId)
      outGW.send(new UserEjectedFromMeeting(props.meetingProp.intId, props.recordProp.record, msg.userId, msg.ejectedBy))
      outGW.send(new DisconnectUser(props.meetingProp.intId, msg.userId))

      outGW.send(new UserLeft(msg.meetingID, props.recordProp.record, user))
    }
  }
}
