package org.bigbluebutton.common2.messages

object NewGuestsWaitingApprovalEvtMsg {
  val NAME = "NewGuestsWaitingApprovalEvtMsg"

  def apply(meetingId: String, userId: String, guests: Vector[Guest]): NewGuestsWaitingApprovalEvtMsg = {
    val header = BbbClientMsgHeader(GetGuestsWaitingApprovalRespMsg.NAME, meetingId, userId)

    val body = NewGuestsWaitingApprovalEvtMsgBody(guests)
    NewGuestsWaitingApprovalEvtMsg(header, body)
  }
}

case class NewGuestsWaitingApprovalEvtMsg(header: BbbClientMsgHeader,
                                          body: NewGuestsWaitingApprovalEvtMsgBody) extends BbbCoreMsg
case class NewGuestsWaitingApprovalEvtMsgBody(guests: Vector[Guest])

