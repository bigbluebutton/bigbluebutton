package org.bigbluebutton.common2.messages.users


import org.bigbluebutton.common2.messages._

object ValidateAuthTokenReqMsg {
  val NAME = "ValidateAuthTokenReqMsg"

  def apply(meetingId: String, userId: String, authToken: String): ValidateAuthTokenReqMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = ValidateAuthTokenReqMsgBody(userId, authToken)
    ValidateAuthTokenReqMsg(header, body)
  }
}

case class ValidateAuthTokenReqMsg(header: BbbClientMsgHeader,
                                   body: ValidateAuthTokenReqMsgBody) extends BbbCoreMsg
case class ValidateAuthTokenReqMsgBody(userId: String, authToken: String)
