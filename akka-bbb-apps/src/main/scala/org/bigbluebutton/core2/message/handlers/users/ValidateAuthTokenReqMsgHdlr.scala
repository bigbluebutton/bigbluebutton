package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.msgs._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.apps.users.UsersApp
import org.bigbluebutton.core.domain.MeetingState2x
import org.bigbluebutton.core.models._
import org.bigbluebutton.core.running.{ HandlerHelpers, LiveMeeting }

trait ValidateAuthTokenReqMsgHdlr extends HandlerHelpers {
  this: UsersApp =>

  val liveMeeting: LiveMeeting
  val outGW: OutMessageGateway

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg, state: MeetingState2x): MeetingState2x = {
    log.debug("RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers) match {
      case Some(u) =>
        val guestPolicyType = GuestsWaiting.getGuestPolicy(liveMeeting.guestsWaiting).policy
        if (guestPolicyType == GuestPolicyType.ALWAYS_ACCEPT) {
          userValidatedAndNoNeedToWaitForApproval(outGW, liveMeeting, u, state)
        } else if (guestPolicyType == GuestPolicyType.ASK_MODERATOR) {
          if (u.guest && u.waitingForAcceptance) {
            userValidatedButNeedToWaitForApproval(outGW, liveMeeting, u, state)
          } else {
            userValidatedAndNoNeedToWaitForApproval(outGW, liveMeeting, u, state)
          }
        } else {
          validateTokenFailed(outGW, meetingId = liveMeeting.props.meetingProp.intId,
            userId = msg.body.userId, authToken = msg.body.authToken, valid = false, waitForApproval = false, state)
        }
      case None =>
        validateTokenFailed(outGW, meetingId = liveMeeting.props.meetingProp.intId,
          userId = msg.body.userId, authToken = msg.body.authToken, valid = false, waitForApproval = false, state)
    }
  }
}
