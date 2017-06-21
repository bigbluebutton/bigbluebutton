package org.bigbluebutton.common2.messages.users

import org.bigbluebutton.common2.messages.{BbbClientMsgHeader, BbbCoreMsg}

object ValidateAuthTokenRespMsg { val NAME = "ValidateAuthTokenRespMsg" }
case class ValidateAuthTokenRespMsg(header: BbbClientMsgHeader,
                                    body: ValidateAuthTokenRespMsgBody) extends BbbCoreMsg
case class ValidateAuthTokenRespMsgBody(userId: String, authToken: String, valid: Boolean, waitForApproval: Boolean)


