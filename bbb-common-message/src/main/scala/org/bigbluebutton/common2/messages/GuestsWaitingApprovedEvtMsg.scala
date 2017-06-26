package org.bigbluebutton.common2.messages

object GuestsWaitingApprovedEvtMsg {
  val NAME = "GuestsWaitingApprovedEvtMsg"

  def apply(meetingId: String, userId: String, guests: Vector[GuestWaitingVO]): GuestsWaitingApprovedEvtMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = GuestsWaitingApprovedEvtMsgBody(guests)
    GuestsWaitingApprovedEvtMsg(header, body)
  }
}

case class GuestsWaitingApprovedEvtMsg(header: BbbClientMsgHeader,
                                       body: GuestsWaitingApprovedEvtMsgBody) extends BbbCoreMsg
case class GuestsWaitingApprovedEvtMsgBody(guests: Vector[GuestWaitingVO])

