package org.bigbluebutton.common2.messages

object GetGuestsWaitingApprovalRespMsg {
  val NAME = "GetGuestsWaitingApprovalRespMsg"

  def apply(meetingId: String, userId: String, guests: Vector[Guest]): GetGuestsWaitingApprovalRespMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = GetGuestsWaitingApprovalRespMsgBody(guests)
    GetGuestsWaitingApprovalRespMsg(header, body)
  }
}

case class GetGuestsWaitingApprovalRespMsg(header: BbbClientMsgHeader,
                                           body: GetGuestsWaitingApprovalRespMsgBody) extends BbbCoreMsg
case class GetGuestsWaitingApprovalRespMsgBody(guests: Vector[Guest])

case class Guest(intId: String, name: String, role: String)
