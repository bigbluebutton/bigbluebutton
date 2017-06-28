package org.bigbluebutton.common2.messages

object GetGuestsWaitingApprovalRespMsg {
  val NAME = "GetGuestsWaitingApprovalRespMsg"

  def apply(meetingId: String, userId: String, guests: Vector[GuestWaitingVO]): GetGuestsWaitingApprovalRespMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = GetGuestsWaitingApprovalRespMsgBody(guests)
    GetGuestsWaitingApprovalRespMsg(header, body)
  }
}

case class GetGuestsWaitingApprovalRespMsg(header: BbbClientMsgHeader,
                                           body: GetGuestsWaitingApprovalRespMsgBody) extends BbbCoreMsg
case class GetGuestsWaitingApprovalRespMsgBody(guests: Vector[GuestWaitingVO])

case class GuestWaitingVO(intId: String, name: String, role: String)
