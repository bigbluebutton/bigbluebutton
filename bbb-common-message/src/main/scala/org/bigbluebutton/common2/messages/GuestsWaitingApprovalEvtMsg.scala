package org.bigbluebutton.common2.messages

object GuestsWaitingApprovalEvtMsg {
  val NAME = "GuestsWaitingApprovalEvtMsg"

  def apply(meetingId: String, userId: String, guests: Vector[GuestWaitingVO]): GuestsWaitingApprovalEvtMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = GuestsWaitingApprovalEvtMsgBody(guests)
    GuestsWaitingApprovalEvtMsg(header, body)
  }
}

case class GuestsWaitingApprovalEvtMsg(header: BbbClientMsgHeader,
                                       body: GuestsWaitingApprovalEvtMsgBody) extends BbbCoreMsg
case class GuestsWaitingApprovalEvtMsgBody(guests: Vector[GuestWaitingVO])

