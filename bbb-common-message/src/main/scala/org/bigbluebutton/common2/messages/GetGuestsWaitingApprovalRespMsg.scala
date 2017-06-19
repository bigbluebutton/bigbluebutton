package org.bigbluebutton.common2.messages

object GetGuestsWaitingApprovalRespMsg {
  val NAME = "GetGuestsWaitingApprovalRespMsg"

  def apply(meetingId: String, userId: String, users: Vector[WebUser]): GetGuestsWaitingApprovalRespMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = GetGuestsWaitingApprovalRespMsgBody(users)
    GetGuestsWaitingApprovalRespMsg(header, body)
  }

}

case class GetGuestsWaitingApprovalRespMsg(header: BbbClientMsgHeader, body: GetGuestsWaitingApprovalRespMsgBody) extends BbbCoreMsg
case class GetGuestsWaitingApprovalRespMsgBody(users: Vector[WebUser])

case class Guest(intId: String, name: String, role: String)