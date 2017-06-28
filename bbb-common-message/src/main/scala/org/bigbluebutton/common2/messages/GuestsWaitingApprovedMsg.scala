package org.bigbluebutton.common2.messages

object GuestsWaitingApprovedMsg {
  val NAME = "GuestsWaitingApprovedMsg"

  def apply(meetingId: String, userId: String, guests: Vector[String]): GuestsWaitingApprovedMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = GuestsWaitingApprovedMsgBody(guests)
    GuestsWaitingApprovedMsg(header, body)
  }
}

case class GuestsWaitingApprovedMsg(header: BbbClientMsgHeader,
                                       body: GuestsWaitingApprovedMsgBody) extends BbbCoreMsg
case class GuestsWaitingApprovedMsgBody(guests: Vector[String])

