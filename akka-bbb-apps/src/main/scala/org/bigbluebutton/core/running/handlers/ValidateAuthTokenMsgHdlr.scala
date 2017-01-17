package org.bigbluebutton.core.running.handlers

import org.bigbluebutton.core.api.{ UserJoining, ValidateAuthToken, ValidateAuthTokenReply }
import org.bigbluebutton.core.running.MeetingActor

trait ValidateAuthTokenMsgHdlr {
  this: MeetingActor =>

  def handleValidateAuthToken(msg: ValidateAuthToken): Unit = {
    log.info("Got ValidateAuthToken message. meetingId=" + msg.meetingID + " userId=" + msg.userId)
    usersModel.getRegisteredUserWithToken(msg.token) match {
      case Some(u) =>
        {
          val replyTo = mProps.meetingID + '/' + msg.userId

          //send the reply
          outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, true, msg.correlationId))

          log.info("ValidateToken success. meetingId=" + mProps.meetingID + " userId=" + msg.userId)

          //join the user
          handleUserJoin(new UserJoining(mProps.meetingID, msg.userId, msg.token))

        }
      case None => {
        log.info("ValidateToken failed. meetingId=" + mProps.meetingID + " userId=" + msg.userId)
        outGW.send(new ValidateAuthTokenReply(mProps.meetingID, msg.userId, msg.token, false, msg.correlationId))
      }
    }

  }
}
