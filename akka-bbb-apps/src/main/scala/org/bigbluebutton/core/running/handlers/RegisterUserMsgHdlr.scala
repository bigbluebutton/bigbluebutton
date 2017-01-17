package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.api._
import org.bigbluebutton.core.running.{ MeetingActor, MeetingStateModel }

trait RegisterUserMsgHdlr {
  this: MeetingActor =>

  val state: MeetingStateModel

  def handle(msg: RegisterUser): Unit = {
    if (state.meetingModel.hasMeetingEnded()) {
      // Check first if the meeting has ended and the user refreshed the client to re-connect.
      log.info("Register user failed. Mmeeting has ended. meetingId=" + state.mProps.meetingID + " userId=" + msg.userID)
      outGW.send(new MeetingHasEnded(state.mProps.meetingID, msg.userID))
      outGW.send(new DisconnectUser(state.mProps.meetingID, msg.userID))
    } else {
      val regUser = new RegisteredUser(msg.userID, msg.extUserID, msg.name, msg.role, msg.authToken,
        msg.avatarURL, msg.guest, msg.authenticated)
      state.usersModel.addRegisteredUser(msg.authToken, regUser)

      log.info("Register user success. meetingId=" + state.mProps.meetingID + " userId=" + msg.userID + " user=" + regUser)
      outGW.send(new UserRegistered(state.mProps.meetingID, state.mProps.recorded, regUser))
    }

  }
}
