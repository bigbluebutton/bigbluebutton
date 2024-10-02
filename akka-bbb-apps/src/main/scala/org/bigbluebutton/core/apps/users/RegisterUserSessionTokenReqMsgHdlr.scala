package org.bigbluebutton.core.apps.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ LiveMeeting, OutMsgRouter }
import org.bigbluebutton.core2.message.senders.Sender

trait RegisterUserSessionTokenReqMsgHdlr {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMsgRouter

  def handleRegisterUserSessionTokenReqMsg(msg: RegisterUserSessionTokenReqMsg): Unit = {
    for {
      ru <- RegisteredUsers.findWithUserId(msg.body.userId, liveMeeting.registeredUsers)
    } yield {
      val updatedRU = RegisteredUsers.addUserSessionToken(liveMeeting.registeredUsers, ru, msg.body.sessionToken, msg.body.enforceLayout)
      log.info("Register user session token success. meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.body.userId + " sessionToken=" + msg.body.sessionToken)

      if (msg.body.userSessionMetadata.nonEmpty) {
        //TODO store user session metadata
      }

      if (msg.body.replaceSessionToken.nonEmpty) {
        RegisteredUsers.removeUserSessionToken(liveMeeting.registeredUsers, updatedRU, msg.body.replaceSessionToken)
        log.info("Replaced user session token success. meetingId=" + liveMeeting.props.meetingProp.intId + " userId=" + msg.body.userId + " sessionToken=" + msg.body.replaceSessionToken)

        //Close user connection
        Sender.sendForceUserGraphqlDisconnectionSysMsg(liveMeeting.props.meetingProp.intId, updatedRU.id, Vector(msg.body.replaceSessionToken), "user connected with a new session token", "session_token_replaced", outGW)
      }

    }

  }
}
