package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.MeetingActor

trait RegisterUserMsgHdlr {
  this: MeetingActor =>

  def handle(msg: RegisterUser): Unit = {
    if (meetingModel.hasMeetingEnded()) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + mProps.meetingID + " userId=" + msg.userID)
      outGW.send(new MeetingHasEnded(mProps.meetingID, msg.userID))
      outGW.send(new DisconnectUser(mProps.meetingID, msg.userID))
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken,
        msg.avatarURL, msg.guest, msg.authenticated)
      usersModel.addRegisteredUser(msg.authToken, regUser)

      log.info("Register user success. meetingId=" + mProps.meetingID + " userId=" + msg.userID + " user=" + regUser)
      outGW.send(new UserRegistered(mProps.meetingID, mProps.recorded, regUser))
    }

  }
}
