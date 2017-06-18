package org.bigbluebutton.core2.message.handlers.users

import org.bigbluebutton.common2.messages._
import org.bigbluebutton.core.OutMessageGateway
import org.bigbluebutton.core.models.RegisteredUsers
import org.bigbluebutton.core.running.MeetingActor
import org.bigbluebutton.core2.message.senders.ValidateAuthTokenRespMsgSender

trait ValidateAuthTokenReqMsgHdlr {
  this: MeetingActor =>

  val outGW: OutMessageGateway

  def handleValidateAuthTokenReqMsg(msg: ValidateAuthTokenReqMsg): Unit = {
    log.debug("****** RECEIVED ValidateAuthTokenReqMsg msg {}", msg)

    val valid = RegisteredUsers.getRegisteredUserWithToken(msg.body.authToken, msg.body.userId, liveMeeting.registeredUsers) match {
      case Some(u) => true
      case None => false
    }

    ValidateAuthTokenRespMsgSender.send(outGW, meetingId = props.meetingProp.intId,
      userId = msg.body.userId, authToken = msg.body.authToken, valid = valid)
  }

}
